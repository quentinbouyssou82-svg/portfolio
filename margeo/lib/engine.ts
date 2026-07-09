import type {
  RideAnalysis,
  RideOffer,
  UserProfile,
  Verdict,
} from "./types";
import { formatEur } from "./utils";

/** Coût du temps immobilisé (usure, opportunité) par minute selon le véhicule. */
const TIME_COST_PER_MIN = 0.02;

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Moteur de rentabilité Margeo.
 * Toute la logique est déterministe et basée sur des règles simples,
 * ce qui simule le raisonnement du copilote IA du produit final.
 */
export function analyzeOffer(
  offer: RideOffer,
  profile: UserProfile,
  analyzedAt: string = new Date().toISOString()
): RideAnalysis {
  const totalKm = offer.distanceKm + offer.emptyReturnKm;
  const estimatedCost = round2(
    totalKm * profile.costPerKm + offer.durationMin * TIME_COST_PER_MIN
  );
  const grossGain = offer.payout;
  const netGain = round2(grossGain - estimatedCost);
  const hourlyRate = round2(netGain / (offer.durationMin / 60));

  const score = computeScore(offer, profile, netGain, hourlyRate);
  const verdict = scoreToVerdict(score);
  const { explanation, insights } = buildRecommendation(
    offer,
    profile,
    netGain,
    hourlyRate,
    verdict
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
  };
}

function computeScore(
  offer: RideOffer,
  profile: UserProfile,
  netGain: number,
  hourlyRate: number
): number {
  // Composante principale : taux horaire net vs objectif (0 à 70 pts).
  const hourlyRatio = hourlyRate / profile.targetHourly;
  let score = clamp(hourlyRatio, 0, 1.4) * 50;

  // Bonus si le gain net absolu est confortable (0 à 15 pts).
  score += clamp(netGain / 8, 0, 1) * 15;

  // Malus retour à vide : au-delà de 40 % de la distance, ça pèse (0 à -15 pts).
  const emptyRatio = offer.emptyReturnKm / Math.max(offer.distanceKm, 1);
  if (emptyRatio > 0.4) {
    score -= clamp((emptyRatio - 0.4) * 30, 0, 15);
  }

  // Malus densité : payout/km trop faible signale une course sous-payée.
  const payoutPerKm = offer.payout / Math.max(offer.distanceKm, 1);
  if (payoutPerKm < 1) {
    score -= clamp((1 - payoutPerKm) * 20, 0, 12);
  }

  return Math.round(clamp(score, 0, 100));
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
  verdict: Verdict
): { explanation: string; insights: string[] } {
  const insights: string[] = [];
  const hourlyDelta = round2(hourlyRate - profile.targetHourly);
  const emptyRatio = offer.emptyReturnKm / Math.max(offer.distanceKm, 1);
  const payoutPerKm = offer.payout / Math.max(offer.distanceKm, 1);

  // Explication principale selon le verdict.
  let explanation: string;
  if (verdict === "accept") {
    if (hourlyDelta >= 2) {
      explanation = `Cette course dépasse ton objectif de ${formatEur(
        hourlyDelta
      )} de l'heure. C'est exactement le type de livraison qui fait monter ta moyenne.`;
    } else if (offer.distanceKm >= 8) {
      explanation = `Cette livraison semble intéressante malgré une distance importante : le gain net de ${formatEur(
        netGain
      )} compense largement les kilomètres.`;
    } else {
      explanation = `Course courte et bien payée : ${formatEur(
        netGain
      )} nets en ${offer.durationMin} minutes, au-dessus de ton objectif horaire.`;
    }
  } else if (verdict === "check") {
    if (emptyRatio > 0.6) {
      explanation = `Le retour risque d'être peu rentable : ${offer.emptyReturnKm.toLocaleString(
        "fr-FR"
      )} km à vide après la livraison. Accepte seulement si tu peux enchaîner une course dans cette zone.`;
    } else if (Math.abs(hourlyDelta) < 2) {
      explanation = `Tu es pile sur ton objectif horaire (${formatEur(
        hourlyRate
      )}/h). Rentable, mais pas de marge si la course prend du retard.`;
    } else {
      explanation = `Le gain net de ${formatEur(
        netGain
      )} est correct, mais le temps immobilisé pèse sur ta rentabilité. À prendre si rien de mieux n'arrive.`;
    }
  } else {
    if (payoutPerKm < 0.9) {
      explanation = `À ${payoutPerKm.toLocaleString("fr-FR", {
        maximumFractionDigits: 2,
      })} €/km, cette course est clairement sous-payée. Tu roules presque pour couvrir tes frais.`;
    } else if (netGain <= 0) {
      explanation = `Après tes coûts estimés, cette course te fait perdre de l'argent. Refuse sans hésiter.`;
    } else {
      explanation = `${formatEur(hourlyRate)}/h net, soit ${formatEur(
        Math.abs(hourlyDelta)
      )} sous ton objectif. Ton temps vaut plus que ça.`;
    }
  }

  // Points d'attention secondaires.
  if (hourlyDelta >= 0) {
    insights.push(
      `Taux horaire ${formatEur(hourlyDelta)} au-dessus de ton objectif de ${
        profile.targetHourly
      } €/h.`
    );
  } else {
    insights.push(
      `Taux horaire ${formatEur(Math.abs(hourlyDelta))} sous ton objectif de ${
        profile.targetHourly
      } €/h.`
    );
  }

  if (emptyRatio > 0.5) {
    insights.push(
      `Retour à vide estimé à ${offer.emptyReturnKm.toLocaleString(
        "fr-FR"
      )} km, soit ${Math.round(emptyRatio * 100)} % de la distance de course.`
    );
  } else if (offer.emptyReturnKm <= 1) {
    insights.push("Zone de dépose active : peu de retour à vide à prévoir.");
  }

  if (payoutPerKm >= 1.6) {
    insights.push(
      `Excellente densité : ${payoutPerKm.toLocaleString("fr-FR", {
        maximumFractionDigits: 2,
      })} € par kilomètre.`
    );
  }

  if (offer.durationMin >= 35) {
    insights.push(
      "Course longue : vérifie l'attente au retrait avant d'accepter."
    );
  }

  return { explanation, insights: insights.slice(0, 3) };
}
