import type {
  DecisionState,
  EconomicsBreakdown,
  InsightCard,
  RideAnalysis,
  RideOffer,
  ScoreFactor,
  UserProfile,
  Verdict,
  ReliabilitySummary,
} from "./types";
import { RELIABILITY_PENALTY_CONFIG } from "./reliability/config";
import {
  computeReliabilityScores,
  fieldsFromOffer,
} from "./reliability/compute";
import type { StructuredVisionFields } from "./vision/extraction-types";
import { normalizeVehicle } from "./vehicle-costs";
import { formatEur } from "./utils";

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

const PLATFORM_ADJUSTMENT: Record<RideOffer["platform"], number> = {
  "Uber Eats": 0,
  Deliveroo: -2,
  Stuart: 3,
  "Amazon Flex": 2,
  Autre: 0,
};

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

export interface AnalysisContext {
  fields?: StructuredVisionFields;
  warnings?: string[];
  captureDegraded?: boolean;
  historicalAverageNetGain?: number | null;
  historicalSamples?: number;
  decisionFrequencyPerMonth?: number | null;
  /** Durée d'itinéraire livreur → pickup (OSRM), en minutes. Jamais inventée. */
  pickupTravelMin?: number | null;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function isDenseZone(city: string): boolean {
  return DENSE_CITIES.has(city.toLowerCase().trim());
}

function computeEconomics(
  offer: RideOffer,
  profile: UserProfile,
  estimatedFields: string[],
  pickupTravelMin: number | null = null,
): EconomicsBreakdown {
  const vehicleId = normalizeVehicle(profile.vehicle);
  const timeCostPerMin = TIME_COST_PER_MIN[vehicleId] ?? 0.018;

  const deliveryDistanceKm = offer.distanceKm ?? null;
  const pickupDistanceKm = offer.pickupDistanceKm ?? null;
  const emptyReturnKm = offer.emptyReturnKm ?? null;
  const platformDurationMin = offer.durationMin ?? null;
  const pickupDurationMin =
    pickupDistanceKm != null && pickupTravelMin != null && pickupTravelMin > 0
      ? pickupTravelMin
      : null;

  const knownKm = round2(
    [deliveryDistanceKm, pickupDistanceKm, emptyReturnKm]
      .filter((value): value is number => value != null)
      .reduce((sum, value) => sum + value, 0),
  );

  const totalKm =
    deliveryDistanceKm != null && pickupDistanceKm != null && emptyReturnKm != null
      ? knownKm
      : null;
  const travelKm =
    deliveryDistanceKm != null && pickupDistanceKm != null
      ? round2(deliveryDistanceKm + pickupDistanceKm)
      : null;

  const durationMin =
    platformDurationMin != null
      ? platformDurationMin + (pickupDurationMin ?? 0)
      : null;

  const estimatedCost = round2(
    knownKm * profile.costPerKm +
      (durationMin != null ? durationMin * timeCostPerMin : 0),
  );
  const netGain = round2(offer.payout - estimatedCost);
  const hourlyRate =
    durationMin != null && durationMin > 0
      ? round2(netGain / (durationMin / 60))
      : null;

  const kmForPayout = travelKm ?? deliveryDistanceKm;
  const payoutPerKm =
    kmForPayout != null && kmForPayout > 0
      ? round2(offer.payout / kmForPayout)
      : null;

  return {
    grossGain: offer.payout,
    estimatedCost,
    netGain,
    hourlyRate,
    payoutPerKm,
    knownKm,
    totalKm,
    travelKm,
    deliveryDistanceKm,
    pickupDistanceKm,
    emptyReturnKm,
    pickupDurationMin,
    pickupIsEstimated: estimatedFields.includes("pickupDistanceKm"),
    usedEstimatedValues: estimatedFields.length > 0,
  };
}

/** Verdict brut basé uniquement sur la rentabilité — sans modération fiabilité. */
function computeProfitabilityState(
  economics: EconomicsBreakdown,
  profile: UserProfile,
): DecisionState {
  const minBenefit = profile.minBenefit ?? 6;
  const hourlyFloor = profile.targetHourly;
  const hourlyRate = economics.hourlyRate;
  const maxDistanceKm = profile.maxDistanceKm ?? 8;
  const missionKm = economics.travelKm;

  if (economics.netGain <= 0) return "unprofitable";
  if (hourlyRate != null && hourlyRate < hourlyFloor * 0.6) return "unprofitable";
  if (economics.netGain < minBenefit * 0.45) return "unprofitable";

  if (economics.pickupDistanceKm != null && economics.pickupDistanceKm >= 6) {
    if (economics.netGain < minBenefit * 1.3) return "unprofitable";
  }

  if (missionKm != null && missionKm > maxDistanceKm * 1.15) {
    if (missionKm >= maxDistanceKm * 1.8) return "unprofitable";
    return "borderline";
  }

  if (
    hourlyRate != null &&
    hourlyRate >= hourlyFloor &&
    economics.netGain >= minBenefit
  ) {
    return "profitable";
  }

  // Signal net fort même sans durée (€/h non calculable).
  if (
    hourlyRate == null &&
    economics.netGain >= minBenefit * 1.75
  ) {
    return "profitable";
  }

  return "borderline";
}

function profitabilityStateToVerdict(state: DecisionState): Verdict {
  switch (state) {
    case "profitable":
      return "accept";
    case "unprofitable":
      return "refuse";
    case "borderline":
    case "uncertain":
      return "check";
  }
}

export function moderateVerdictByReliability(
  rawVerdict: Verdict,
  reliability: ReliabilitySummary,
  profitabilityScore: number,
): Verdict {
  const confidence = reliability.decisionConfidence;
  const { acceptMinConfidence, refuseMinConfidence } =
    RELIABILITY_PENALTY_CONFIG.thresholds;

  if (rawVerdict === "accept" && confidence < acceptMinConfidence) {
    return "check";
  }

  if (
    rawVerdict === "refuse" &&
    confidence < refuseMinConfidence &&
    profitabilityScore > 35
  ) {
    return "check";
  }

  return rawVerdict;
}

function computeProfitabilityScore(
  offer: RideOffer,
  profile: UserProfile,
  economics: EconomicsBreakdown,
): { score: number; breakdown: ScoreFactor[] } {
  let score = 50;
  const breakdown: ScoreFactor[] = [];

  if (economics.hourlyRate != null) {
    const hourlyDelta = economics.hourlyRate - profile.targetHourly;
    const impact = clamp(hourlyDelta * 2.2, -24, 24);
    score += impact;
    breakdown.push({
      label: hourlyDelta >= 0 ? "Rémunération horaire" : "Rémunération horaire faible",
      impact: Math.round(impact),
      detail:
        hourlyDelta >= 0
          ? `${formatEur(economics.hourlyRate)}/h net, au-dessus de ton objectif.`
          : `${formatEur(economics.hourlyRate)}/h net, sous ton objectif de ${profile.targetHourly} €/h.`,
    });
  }

  if (economics.payoutPerKm != null) {
    let impact = 0;
    if (economics.payoutPerKm >= 1.5) impact = 10;
    else if (economics.payoutPerKm >= 1.1) impact = 4;
    else if (economics.payoutPerKm < 0.9) impact = -10;
    else impact = -4;
    score += impact;
    breakdown.push({
      label: impact >= 0 ? "Densité €/km" : "Densité €/km faible",
      impact,
      detail: `${economics.payoutPerKm.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} €/km.`,
    });
  }

  if (economics.pickupDistanceKm != null) {
    let pickupImpact = 0;
    if (economics.pickupDistanceKm <= 0.8) pickupImpact = 6;
    else if (economics.pickupDistanceKm <= 1.5) pickupImpact = 2;
    else if (economics.pickupDistanceKm <= 3) pickupImpact = -4;
    else if (economics.pickupDistanceKm <= 5) pickupImpact = -10;
    else if (economics.pickupDistanceKm <= 8) pickupImpact = -16;
    else pickupImpact = -22;
    score += pickupImpact;
    breakdown.push({
      label: pickupImpact >= 0 ? "Restaurant proche" : "Restaurant éloigné",
      impact: pickupImpact,
      detail: `${economics.pickupDistanceKm.toLocaleString("fr-FR")} km avant retrait.`,
    });
  }

  if (economics.emptyReturnKm != null && economics.deliveryDistanceKm != null) {
    const emptyRatio =
      economics.emptyReturnKm / Math.max(economics.deliveryDistanceKm, 1);
    let impact = 0;
    if (emptyRatio <= 0.25) impact = 8;
    else if (emptyRatio <= 0.45) impact = 0;
    else if (emptyRatio <= 0.7) impact = -8;
    else impact = -14;

    const emptyPreference = profile.emptyReturns ?? "short_only";
    if (emptyPreference === "no" && economics.emptyReturnKm > 1.5) {
      impact -= 8;
    } else if (emptyPreference === "short_only" && economics.emptyReturnKm > 3) {
      impact -= 5;
    } else if (emptyPreference === "yes" && emptyRatio <= 0.35) {
      impact += 2;
    }

    score += impact;
    breakdown.push({
      label: impact >= 0 ? "Retour à vide limité" : "Retour à vide lourd",
      impact,
      detail: `${economics.emptyReturnKm.toLocaleString("fr-FR")} km à vide.`,
    });
  }

  const netImpact = clamp((economics.netGain - 3) * 2, -10, 10);
  score += netImpact;
  breakdown.push({
    label: economics.netGain >= (profile.minBenefit ?? 6) ? "Gain net" : "Gain net faible",
    impact: Math.round(netImpact),
    detail: `${formatEur(economics.netGain)} net estimé.`,
  });

  const missionKm =
    economics.travelKm ??
    (economics.deliveryDistanceKm != null ? economics.deliveryDistanceKm : null);
  const maxDistanceKm = profile.maxDistanceKm ?? 8;
  if (missionKm != null && missionKm > maxDistanceKm) {
    const over = missionKm - maxDistanceKm;
    const impact = clamp(-over * 2.5, -12, -3);
    score += impact;
    breakdown.push({
      label: "Course plus longue que ta limite",
      impact: Math.round(impact),
      detail: `${missionKm.toLocaleString("fr-FR")} km au total vs ${maxDistanceKm} km max.`,
    });
  }

  score += PLATFORM_ADJUSTMENT[offer.platform] ?? 0;
  if (
    isDenseZone(profile.city) &&
    economics.emptyReturnKm != null &&
    economics.deliveryDistanceKm != null
  ) {
    const emptyRatio =
      economics.emptyReturnKm / Math.max(economics.deliveryDistanceKm, 1);
    if (emptyRatio < 0.5) {
      score += 3;
      breakdown.push({
        label: `Zone active (${profile.city})`,
        impact: 3,
        detail: "Bonne densité potentielle de courses.",
      });
    }
  }

  return {
    score: Math.round(clamp(score, 0, 100)),
    breakdown: breakdown.filter((item) => item.impact !== 0).slice(0, 8),
  };
}

function reliabilityInsightMode(
  confidence: number,
): "certain" | "cautious" | "indicative" {
  const { insightCertainMin, insightCautionMax } =
    RELIABILITY_PENALTY_CONFIG.thresholds;
  if (confidence >= insightCertainMin) return "certain";
  if (confidence >= insightCautionMax) return "cautious";
  return "indicative";
}

function buildRecommendation(
  economics: EconomicsBreakdown,
  profile: UserProfile,
  profitabilityState: DecisionState,
  rawVerdict: Verdict,
  finalVerdict: Verdict,
  reliability: ReliabilitySummary,
  breakdown: ScoreFactor[],
): { explanation: string; insights: string[]; insightCards: InsightCard[] } {
  const insights: string[] = [];
  const cards: InsightCard[] = [];
  const mode = reliabilityInsightMode(reliability.decisionConfidence);
  const topPositive = breakdown
    .filter((f) => f.impact > 0)
    .sort((a, b) => b.impact - a.impact)[0];
  const topNegative = breakdown
    .filter((f) => f.impact < 0)
    .sort((a, b) => a.impact - b.impact)[0];

  let explanation = "Analyse basée sur les informations disponibles.";

  if (profitabilityState === "profitable") {
    explanation =
      finalVerdict === "check" && rawVerdict === "accept"
        ? "La course semble rentable, mais certaines informations sont estimées ou incomplètes."
        : topPositive
          ? `${topPositive.label} : ${topPositive.detail}`
          : `Cette course dépasse tes critères avec ${formatEur(economics.netGain)} net estimé.`;
  } else if (profitabilityState === "unprofitable") {
    explanation =
      reliability.decisionConfidence >= 85
        ? topNegative
          ? `${topNegative.label} : ${topNegative.detail}`
          : `Estimation défavorable : ${formatEur(economics.netGain)} net.`
        : topNegative
          ? `${topNegative.label}, mais vérifie les données estimées.`
          : `Estimation défavorable — confirme les informations manquantes si besoin.`;
  } else {
    explanation =
      topPositive && topNegative
        ? `${topPositive.label}, mais ${topNegative.label.toLowerCase()}.`
        : "Rentabilité estimée limite : vérifie selon ta journée et ta zone.";
  }

  if (finalVerdict === "check" && rawVerdict === "accept") {
    cards.push({
      kind: "caution",
      title: "À vérifier",
      body: "La course semble rentable, mais la fiabilité de l'analyse reste modérée.",
      isEstimate: true,
    });
  }

  if (profitabilityState === "unprofitable" && economics.netGain <= 0) {
    const amount = formatEur(Math.abs(economics.netGain));
    if (mode === "certain") {
      cards.push({
        kind: "savings",
        title: "Tu viens d'économiser",
        value: amount,
        body: "En refusant cette course, tu évites un gain net négatif estimé.",
        isEstimate: false,
      });
    } else if (mode === "cautious") {
      cards.push({
        kind: "savings",
        title: "Économie potentielle",
        value: `~${amount}`,
        body: "Certaines données utilisées pour ce calcul sont estimées.",
        isEstimate: true,
      });
    }
  } else if (profitabilityState === "profitable" && economics.hourlyRate != null) {
    if (mode === "certain") {
      cards.push({
        kind: "hourly",
        title: "Bonne course",
        value: `${formatEur(economics.hourlyRate)}/h`,
        body: "Taux horaire net estimé pour cette course.",
        isEstimate: false,
      });
    } else if (mode === "cautious") {
      cards.push({
        kind: "hourly",
        title: "Rythme estimé",
        value: `~${formatEur(economics.hourlyRate)}/h`,
        body: "Le €/h dépend encore de données partiellement confirmées.",
        isEstimate: true,
      });
    }
  }

  if (reliability.estimatedFields.length > 0) {
    insights.push(
      `Données estimées : ${reliability.estimatedFields.join(", ")}.`,
    );
  } else if (reliability.cautionFields.length > 0) {
    insights.push("Certaines informations n'ont pas pu être confirmées.");
  }

  if (economics.hourlyRate != null) {
    const hourlyDelta = round2(economics.hourlyRate - profile.targetHourly);
    insights.push(
      hourlyDelta >= 0
        ? `Environ ${formatEur(hourlyDelta)} au-dessus de ton objectif horaire.`
        : `Environ ${formatEur(Math.abs(hourlyDelta))} sous ton objectif horaire.`,
    );
  }

  const pickupKm = economics.pickupDistanceKm;
  const pickupReliable =
    pickupKm != null &&
    !economics.pickupIsEstimated &&
    mode !== "indicative";
  if (pickupReliable && pickupKm >= 2 && cards.length < 3) {
    const pickupLabel = pickupKm.toLocaleString("fr-FR", {
      maximumFractionDigits: 1,
    });
    if (pickupKm >= 4) {
      cards.push({
        kind: "pickup",
        title: "Pickup éloigné",
        value: `${pickupLabel} km`,
        body: `Ces ${pickupLabel} km jusqu'au restaurant réduisent fortement la rentabilité de cette course.`,
        isEstimate: false,
      });
    } else {
      cards.push({
        kind: "pickup",
        title: "Restaurant",
        value: `${pickupLabel} km`,
        body: `Le restaurant est à ${pickupLabel} km.`,
        isEstimate: false,
      });
    }
  }

  return {
    explanation,
    insights: insights.slice(0, 3),
    insightCards: cards.slice(0, 3),
  };
}

export function analyzeOffer(
  offer: RideOffer,
  profile: UserProfile,
  analyzedAt: string = new Date().toISOString(),
  context: AnalysisContext = {},
): RideAnalysis {
  const fields = context.fields ?? fieldsFromOffer(offer);
  const pickupTravelMin = context.pickupTravelMin ?? null;
  const preliminaryEconomics = computeEconomics(
    offer,
    profile,
    [],
    pickupTravelMin,
  );

  const reliability = computeReliabilityScores({
    fields,
    offer,
    profile,
    warnings: context.warnings,
    captureDegraded: context.captureDegraded,
    economics: preliminaryEconomics,
  });

  const economics = computeEconomics(
    offer,
    profile,
    reliability.estimatedFields,
    pickupTravelMin,
  );

  const profitabilityState = computeProfitabilityState(economics, profile);
  const rawVerdict = profitabilityStateToVerdict(profitabilityState);
  const { score, breakdown } = computeProfitabilityScore(
    offer,
    profile,
    economics,
  );
  const verdict = moderateVerdictByReliability(rawVerdict, reliability, score);

  const { explanation, insights, insightCards } = buildRecommendation(
    economics,
    profile,
    profitabilityState,
    rawVerdict,
    verdict,
    reliability,
    breakdown,
  );

  return {
    id: offer.id,
    offer,
    analyzedAt,
    grossGain: economics.grossGain,
    estimatedCost: economics.estimatedCost,
    netGain: economics.netGain,
    hourlyRate: economics.hourlyRate ?? 0,
    score,
    verdict,
    decisionState: profitabilityState,
    reliability,
    economics,
    explanation,
    insights,
    insightCards,
    scoreBreakdown: breakdown,
  };
}
