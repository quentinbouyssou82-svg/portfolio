import type { RideOffer, UserProfile } from "../types";

/**
 * Mesure l'importance d'un champ manquant/estimé pour CETTE analyse.
 * 0.25 = peu impactant sur la décision · 1.0 = critique.
 */
export function fieldCriticalityForCalculation(
  field:
    | "distanceKm"
    | "durationMin"
    | "emptyReturnKm"
    | "pickupDistanceKm",
  offer: RideOffer,
  profile: UserProfile,
): number {
  const minBenefit = profile.minBenefit ?? 6;
  const payout = offer.payout;

  switch (field) {
    case "durationMin": {
      // €/h crucial seulement si la rentabilité n'est pas déjà évidente via le payout.
      if (payout <= minBenefit * 0.55) return 0.3;
      if (payout >= minBenefit * 2.2) return 0.45;
      if (offer.distanceKm != null) {
        const perKm = payout / Math.max(offer.distanceKm, 0.5);
        if (perKm >= 2) return 0.5;
        if (perKm <= 0.8) return 0.35;
      }
      return 0.95;
    }
    case "distanceKm": {
      // Distance manquante : moins pénalisante si le payout seul oriente déjà la décision.
      if (payout >= minBenefit * 3) return 0.35;
      if (payout <= minBenefit * 0.5) return 0.4;
      if (payout >= minBenefit * 1.8) return 0.5;
      return 0.9;
    }
    case "emptyReturnKm":
      return 0.55;
    case "pickupDistanceKm": {
      if (offer.distanceKm != null && offer.distanceKm > 0) {
        const perKm = payout / offer.distanceKm;
        if (perKm < 1.05) return 0.7;
        if (perKm >= 2) return 0.35;
      }
      return 0.5;
    }
    default:
      return 0.7;
  }
}

/** Clarté du signal économique (0–100) pour la confiance décision. */
export function economicsClarityScore(
  offer: RideOffer,
  profile: UserProfile,
  partial: {
    netGain: number | null;
    hourlyRate: number | null;
    payoutPerKm: number | null;
  },
): number {
  let clarity = 50;
  const minBenefit = profile.minBenefit ?? 6;

  if (partial.netGain != null) {
    if (partial.netGain <= 0) clarity += 28;
    else if (partial.netGain >= minBenefit * 1.5) clarity += 22;
    else if (partial.netGain < minBenefit * 0.6) clarity += 18;
    else clarity -= 8;
  }

  if (partial.hourlyRate != null) {
    const delta = partial.hourlyRate - profile.targetHourly;
    if (Math.abs(delta) >= 6) clarity += 12;
    else if (Math.abs(delta) <= 2) clarity -= 10;
  } else {
    clarity -= 6;
  }

  if (partial.payoutPerKm != null) {
    if (partial.payoutPerKm >= 1.6 || partial.payoutPerKm <= 0.7) clarity += 8;
    else clarity -= 4;
  }

  return Math.min(100, Math.max(0, clarity));
}
