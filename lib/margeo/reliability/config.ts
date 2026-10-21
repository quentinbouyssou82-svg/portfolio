/**
 * Poids de pénalité — calibrés via scripts/bench-driveely-reliability.ts.
 * Ne pas traiter ces valeurs comme définitives sans relancer le benchmark.
 */
export const RELIABILITY_PENALTY_CONFIG = {
  /** Plancher global (sauf payout illisible). */
  floor: 25,
  /** Seuils verdict / insights. */
  thresholds: {
    acceptMinConfidence: 85,
    refuseMinConfidence: 70,
    insightCertainMin: 80,
    insightCautionMax: 65,
  },
  /** Pénalités extraction de base (points sur 100). */
  extraction: {
    payout_ambiguous: 20,
    payout_suspicious: 12,
    distance_missing: 14,
    distance_ambiguous: 8,
    distance_estimated: 12,
    duration_missing: 12,
    duration_estimated: 10,
    empty_return_unknown: 10,
    pickup_distance_unknown: 6,
    pickup_missing: 8,
    dropoff_missing: 5,
    platform_unknown: 5,
    multiple_offers: 25,
    capture_degraded: 30,
    incoherent_values: 15,
  },
  /** Pénalités calcul de base (multipliées par criticité contextuelle). */
  calculation: {
    missing_duration: 22,
    missing_distance: 18,
    missing_empty_return: 10,
    missing_pickup: 8,
    estimated_field: 8,
    estimated_field_max: 24,
    partial_total_km: 12,
    ambiguous_critical_field: 10,
    multiple_offers: 18,
    capture_degraded: 22,
  },
  /** Pondération confiance décision. */
  decisionBlend: {
    extraction: 0.45,
    calculation: 0.35,
    clarity: 0.2,
  },
} as const;

export type ReliabilityPenaltyCode =
  | keyof typeof RELIABILITY_PENALTY_CONFIG.extraction
  | keyof typeof RELIABILITY_PENALTY_CONFIG.calculation;
