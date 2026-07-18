import type {
  Platform,
  RideAnalysis,
  RideOffer,
  ScoreFactor,
  UserProfile,
  Verdict,
} from "./types";
import { formatEur } from "./utils";

/** Coût du temps immobilisé (usure, opportunité) par minute selon le véhicule. */
const TIME_COST_PER_MIN: Record<UserProfile["vehicle"], number> = {
  velo: 0.01,
  velo_electrique: 0.012,
  trottinette_electrique: 0.012,
  scooter: 0.018,
  scooter_thermique: 0.018,
  scooter_electrique: 0.014,
  moto: 0.022,
  voiture: 0.03,
  voiture_essence: 0.03,
  voiture_diesel: 0.028,
  voiture_hybride: 0.025,
  voiture_electrique: 0.02,
};

const PLATFORM_ADJUSTMENT: Record<Platform, number> = {
  "Uber Eats": 0,
  Deliveroo: -2,
  Stuart: 3,
  "Amazon Flex": 2,
  Autre: 0,
};

/** Zones denses = meilleur retour à vide estimé. */
const DENSE_CITIES = new Set([
  "paris",
  "lyon",
  "marseille",
  "toulouse",
  "bordeaux",
  "lille",
  "nantes",
  "strasbourg",
  "montpellier",
  "nice",
]);

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function isDenseZone(city: string): boolean {
  return DENSE_CITIES.has(city.toLowerCase().trim());
}

/**
 * Moteur de rentabilité Margeo v2.
 * Score explicable basé sur véhicule, coût/km, objectif €/h, distance, temps, plateforme et zone.
 */
export function analyzeOffer(
  offer: RideOffer,
  profile: UserProfile,
  analyzedAt: string = new Date().toISOString(),
): RideAnalysis {
  const pickupKm = offer.pickupDistanceKm ?? 0;
  const hasDistance = offer.distanceKm != null;
  const hasDuration = offer.durationMin != null;
  const distanceKm = offer.distanceKm ?? 0;
  const durationMin = offer.durationMin ?? 0;

  const totalKm = pickupKm + distanceKm + offer.emptyReturnKm;
  const timeCost = TIME_COST_PER_MIN[profile.vehicle];
  const estimatedCost = round2(
    totalKm * profile.costPerKm +
      (hasDuration ? durationMin * timeCost : 0),
  );
  const grossGain = offer.payout;
  const netGain = round2(grossGain - estimatedCost);
  const hourlyRate = hasDuration
    ? round2(netGain / (durationMin / 60))
    : 0;

  const { score, breakdown } = computeScoreWithBreakdown(
    offer,
    profile,
    netGain,
    hourlyRate,
    { hasDistance, hasDuration },
  );
  let verdict = scoreToVerdict(score);
  if (!hasDistance || !hasDuration) {
    if (verdict === "accept") verdict = "check";
  }
  const { explanation, insights } = buildRecommendation(
    offer,
    profile,
    netGain,
    hourlyRate,
    verdict,
    breakdown,
  );

  return {
    id: offer.id,
    offer,
    analyzedAt,
    grossGain,
    estimatedCost,
    netGain,
    hourlyRate,
    score,
    verdict,
    explanation,
    insights,
    scoreBreakdown: breakdown,
  };
}

function computeScoreWithBreakdown(
  offer: RideOffer,
  profile: UserProfile,
  netGain: number,
  hourlyRate: number,
  flags: { hasDistance: boolean; hasDuration: boolean },
): { score: number; breakdown: ScoreFactor[] } {
  const breakdown: ScoreFactor[] = [];
  let score = 50;
  const pickupKm = offer.pickupDistanceKm ?? 0;

  // 1. Taux horaire vs objectif (±25 pts)
  if (flags.hasDuration) {
    const hourlyDelta = hourlyRate - profile.targetHourly;
    const hourlyImpact = clamp(hourlyDelta * 2.5, -25, 25);
    score += hourlyImpact;
    breakdown.push({
      label:
        hourlyDelta >= 0
          ? "Bonne rémunération horaire"
          : "Rémunération horaire faible",
      impact: Math.round(hourlyImpact),
      detail:
        hourlyDelta >= 0
          ? `${formatEur(hourlyRate)}/h net, soit ${formatEur(hourlyDelta)} au-dessus de ton objectif.`
          : `${formatEur(hourlyRate)}/h net, soit ${formatEur(Math.abs(hourlyDelta))} sous ton objectif de ${profile.targetHourly} €/h.`,
    });
  } else {
    breakdown.push({
      label: "Durée non lue sur la capture",
      impact: -8,
      detail: "Le €/h n'a pas pu être calculé — verdict prudent.",
    });
    score -= 8;
  }

  // 2. Distance / densité (±12 pts)
  if (flags.hasDistance && offer.distanceKm != null) {
    const payoutPerKm = offer.payout / Math.max(offer.distanceKm, 0.5);
    let distanceImpact = 0;
    if (payoutPerKm >= 1.5) {
      distanceImpact = 10;
    } else if (payoutPerKm >= 1.1) {
      distanceImpact = 5;
    } else if (payoutPerKm < 0.9) {
      distanceImpact = -12;
    } else {
      distanceImpact = -4;
    }
    score += distanceImpact;
    breakdown.push({
      label:
        distanceImpact >= 0 ? "Distance acceptable" : "Distance peu rentable",
      impact: distanceImpact,
      detail: `${payoutPerKm.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} €/km sur ${offer.distanceKm} km.`,
    });
  } else {
    breakdown.push({
      label: "Distance non lue sur la capture",
      impact: -6,
      detail: "Impossible d'évaluer la densité €/km.",
    });
    score -= 6;
  }

  // 2b. Distance jusqu'au point de récupération (±12 pts)
  if (pickupKm > 0) {
    let pickupImpact = 0;
    if (pickupKm <= 1.5) {
      pickupImpact = 10;
    } else if (pickupKm <= 3) {
      pickupImpact = 2;
    } else if (pickupKm <= 5) {
      pickupImpact = -6;
    } else {
      pickupImpact = -12;
    }
    score += pickupImpact;
    breakdown.push({
      label:
        pickupImpact >= 0
          ? "Tu es proche du restaurant"
          : "Restaurant éloigné de ta position",
      impact: pickupImpact,
      detail: `${pickupKm.toLocaleString("fr-FR")} km jusqu'au point de récupération.`,
    });
  }

  // 3. Retour à vide (±15 pts)
  if (flags.hasDistance && offer.distanceKm != null) {
    const emptyRatio = offer.emptyReturnKm / Math.max(offer.distanceKm, 1);
  let emptyImpact = 0;
  if (emptyRatio <= 0.25) {
    emptyImpact = 8;
  } else if (emptyRatio <= 0.45) {
    emptyImpact = 0;
  } else if (emptyRatio <= 0.7) {
    emptyImpact = -8;
  } else {
    emptyImpact = -15;
  }

  if (!isDenseZone(profile.city) && emptyRatio > 0.4) {
    emptyImpact -= 3;
  }

  score += emptyImpact;
  breakdown.push({
    label:
      emptyImpact >= 0
        ? "Retour à vide limité"
        : "Retour difficile estimé",
    impact: emptyImpact,
    detail: `${offer.emptyReturnKm.toLocaleString("fr-FR")} km à vide (${Math.round(emptyRatio * 100)} % de la course).`,
  });
  }

  // 4. Gain net absolu (±10 pts)
  const netImpact = clamp((netGain - 3) * 2, -10, 10);
  score += netImpact;
  if (netGain <= 0) {
    breakdown.push({
      label: "Gain net négatif",
      impact: -10,
      detail: `Après ${formatEur(offer.payout - netGain)} de coûts estimés, tu perds de l'argent.`,
    });
  } else {
    breakdown.push({
      label: netGain >= 6 ? "Gain net confortable" : "Gain net modeste",
      impact: Math.round(netImpact),
      detail: `${formatEur(netGain)} nets${flags.hasDuration && offer.durationMin != null ? ` pour ${offer.durationMin} min de travail` : ""}.`,
    });
  }

  // 5. Plateforme (±5 pts)
  const platformImpact = PLATFORM_ADJUSTMENT[offer.platform] ?? 0;
  if (platformImpact !== 0) {
    score += platformImpact;
    breakdown.push({
      label: `Plateforme ${offer.platform}`,
      impact: platformImpact,
      detail:
        platformImpact > 0
          ? "Historiquement favorable sur ce type de course."
          : "Souvent plus d'attente ou de frais cachés.",
    });
  }

  // 6. Véhicule vs durée (±5 pts) — courses longues pénalisent vélo
  let vehicleImpact = 0;
  if (profile.vehicle === "velo" && offer.durationMin != null && offer.durationMin > 25) {
    vehicleImpact = -5;
    breakdown.push({
      label: "Course longue en vélo",
      impact: vehicleImpact,
      detail: `${offer.durationMin} min estimées — fatigue accrue.`,
    });
  } else if (
    (profile.vehicle === "velo" || profile.vehicle === "velo_electrique") &&
    offer.durationMin != null &&
    offer.durationMin > 35
  ) {
    vehicleImpact = -3;
    breakdown.push({
      label: "Course longue à vélo",
      impact: vehicleImpact,
      detail: `${offer.durationMin} min — prévois une pause hydratation.`,
    });
  } else if (profile.vehicle === "voiture" && offer.distanceKm != null && offer.distanceKm < 2) {
    vehicleImpact = -4;
    breakdown.push({
      label: "Course courte en voiture",
      impact: vehicleImpact,
      detail: "Démarrage moteur peu rentable sur courte distance.",
    });
  }

  score += vehicleImpact;

  // 7. Zone dense bonus léger (+3)
  if (
    isDenseZone(profile.city) &&
    flags.hasDistance &&
    offer.distanceKm != null
  ) {
    const emptyRatio = offer.emptyReturnKm / Math.max(offer.distanceKm, 1);
    if (emptyRatio < 0.5) {
    score += 3;
    breakdown.push({
      label: `Zone active (${profile.city})`,
      impact: 3,
      detail: "Bonne densité de courses, retour facilité.",
    });
    }
  }

  return {
    score: Math.round(clamp(score, 0, 100)),
    breakdown: breakdown.filter((f) => f.impact !== 0).slice(0, 6),
  };
}

function scoreToVerdict(score: number): Verdict {
  if (score >= 68) return "accept";
  if (score >= 42) return "check";
  return "refuse";
}

function buildRecommendation(
  offer: RideOffer,
  profile: UserProfile,
  netGain: number,
  hourlyRate: number,
  verdict: Verdict,
  breakdown: ScoreFactor[],
): { explanation: string; insights: string[] } {
  const insights: string[] = [];
  const hourlyDelta = round2(hourlyRate - profile.targetHourly);
  const emptyRatio =
    offer.emptyReturnKm / Math.max(offer.distanceKm ?? 1, 1);
  const payoutPerKm = offer.payout / Math.max(offer.distanceKm ?? 1, 1);

  const topPositive = breakdown
    .filter((f) => f.impact > 0)
    .sort((a, b) => b.impact - a.impact)[0];
  const topNegative = breakdown
    .filter((f) => f.impact < 0)
    .sort((a, b) => a.impact - b.impact)[0];

  let explanation: string;
  if (verdict === "accept") {
    if (topPositive) {
      explanation = `${topPositive.label} : ${topPositive.detail} C'est une course à prendre.`;
    } else if (hourlyDelta >= 2) {
      explanation = `Cette course dépasse ton objectif de ${formatEur(hourlyDelta)} de l'heure.`;
    } else {
      explanation = `Gain net de ${formatEur(netGain)}${offer.durationMin != null ? ` en ${offer.durationMin} min` : ""} — au-dessus de tes critères.`;
    }
  } else if (verdict === "check") {
    if (topNegative && topPositive) {
      explanation = `${topPositive.label}, mais ${topNegative.label.toLowerCase()}. À prendre seulement si tu peux enchaîner dans la zone.`;
    } else if (emptyRatio > 0.6) {
      explanation = `Retour à vide estimé à ${offer.emptyReturnKm.toLocaleString("fr-FR")} km. Accepte si une autre course t'attend dans le secteur.`;
    } else {
      explanation = `Rentabilité limite : ${formatEur(hourlyRate)}/h net. À toi de juger selon ta journée.`;
    }
  } else {
    if (netGain <= 0) {
      explanation = `Après tes coûts (${profile.vehicle}, ${profile.costPerKm} €/km), cette course te fait perdre de l'argent.`;
    } else if (topNegative) {
      explanation = `${topNegative.label} : ${topNegative.detail} Refuse si tu as mieux.`;
    } else {
      explanation = `${formatEur(hourlyRate)}/h net — trop loin de ton objectif de ${profile.targetHourly} €/h.`;
    }
  }

  if (hourlyDelta >= 0) {
    insights.push(
      `Taux horaire ${formatEur(hourlyDelta)} au-dessus de ton objectif.`,
    );
  } else {
    insights.push(
      `Taux horaire ${formatEur(Math.abs(hourlyDelta))} sous ton objectif.`,
    );
  }

  if (emptyRatio > 0.5) {
    insights.push(
      `Retour à vide : ${offer.emptyReturnKm.toLocaleString("fr-FR")} km (${Math.round(emptyRatio * 100)} %).`,
    );
  }

  if (payoutPerKm >= 1.6) {
    insights.push(
      `Bonne densité : ${payoutPerKm.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} €/km.`,
    );
  }

  if (offer.durationMin != null && offer.durationMin >= 35) {
    insights.push("Course longue — vérifie l'attente au retrait.");
  }

  return { explanation, insights: insights.slice(0, 3) };
}
