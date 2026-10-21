import type {
  EconomicsBreakdown,
  ReliabilityPenalty,
  ReliabilitySummary,
  RideOffer,
  UserProfile,
} from "../types";
import type { StructuredVisionFields } from "../vision/extraction-types";
import { RELIABILITY_PENALTY_CONFIG } from "./config";
import {
  economicsClarityScore,
  fieldCriticalityForCalculation,
} from "./criticality";

const cfg = RELIABILITY_PENALTY_CONFIG;

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function labelFromConfidence(score: number): ReliabilitySummary["label"] {
  if (score >= 90) return "very_high";
  if (score >= 74) return "good";
  if (score >= 50) return "indicative";
  return "low";
}

function applyPenalties(
  base: number,
  penalties: ReliabilityPenalty[],
  floor = cfg.floor,
): number {
  const total = penalties.reduce((sum, p) => sum + p.points, 0);
  return clamp(Math.round(base - total), floor, 100);
}

function pushPenalty(
  penalties: ReliabilityPenalty[],
  code: string,
  points: number,
  severity: ReliabilityPenalty["severity"],
  field?: string,
  reason?: string,
) {
  if (points <= 0) return;
  penalties.push({ code, points: Math.round(points), severity, field, reason });
}

function fieldConfidencePct(
  field: { confidence: number; isEstimated: boolean; value: unknown } | undefined,
): number {
  if (!field || field.value == null) return 0;
  return Math.round(field.confidence * 100);
}

export interface ReliabilityInput {
  fields: StructuredVisionFields;
  offer: RideOffer;
  profile: UserProfile;
  warnings?: string[];
  captureDegraded?: boolean;
  economics?: EconomicsBreakdown | null;
  /** Source extraction — OCR local légèrement pénalisé (−5) tant qu'en validation. */
  extractionSource?: "vision" | "on_device_ocr";
}

function computeExtractionPenalties(input: ReliabilityInput): ReliabilityPenalty[] {
  const { fields, offer, warnings = [] } = input;
  const penalties: ReliabilityPenalty[] = [];
  const ext = cfg.extraction;

  if (offer.payout <= 0) {
    pushPenalty(penalties, "payout_unreadable", 100, "critical", "payout");
    return penalties;
  }

  const payoutConf = fieldConfidencePct(fields.payout);
  if (payoutConf > 0 && payoutConf < 70) {
    pushPenalty(
      penalties,
      "payout_ambiguous",
      ext.payout_ambiguous,
      "major",
      "payout",
    );
  } else if (offer.payout < 2) {
    pushPenalty(
      penalties,
      "payout_suspicious",
      ext.payout_suspicious,
      "moderate",
      "payout",
    );
  }

  if (fields.distanceKm.value == null) {
    pushPenalty(
      penalties,
      "distance_missing",
      ext.distance_missing,
      "major",
      "distanceKm",
    );
  } else if (fields.distanceKm.isEstimated) {
    pushPenalty(
      penalties,
      "distance_estimated",
      ext.distance_estimated,
      "major",
      "distanceKm",
    );
  } else if (fieldConfidencePct(fields.distanceKm) < 85) {
    pushPenalty(
      penalties,
      "distance_ambiguous",
      ext.distance_ambiguous,
      "moderate",
      "distanceKm",
    );
  }

  if (fields.durationMin.value == null) {
    pushPenalty(
      penalties,
      "duration_missing",
      ext.duration_missing,
      "major",
      "durationMin",
    );
  } else if (fields.durationMin.isEstimated) {
    pushPenalty(
      penalties,
      "duration_estimated",
      ext.duration_estimated,
      "moderate",
      "durationMin",
    );
  }

  if (fields.emptyReturnKm.value == null) {
    pushPenalty(
      penalties,
      "empty_return_unknown",
      ext.empty_return_unknown,
      "moderate",
      "emptyReturnKm",
    );
  }

  if (fields.pickupDistanceKm.value == null) {
    pushPenalty(
      penalties,
      "pickup_distance_unknown",
      ext.pickup_distance_unknown,
      "minor",
      "pickupDistanceKm",
    );
  }

  if (fields.pickup.value == null) {
    pushPenalty(penalties, "pickup_missing", ext.pickup_missing, "moderate", "pickup");
  }
  if (fields.dropoff.value == null) {
    pushPenalty(penalties, "dropoff_missing", ext.dropoff_missing, "minor", "dropoff");
  }
  if (fields.platform.value == null) {
    pushPenalty(
      penalties,
      "platform_unknown",
      ext.platform_unknown,
      "minor",
      "platform",
    );
  }

  if (fields.multipleOffersDetected) {
    pushPenalty(
      penalties,
      "multiple_offers",
      ext.multiple_offers,
      "major",
      undefined,
      "Plusieurs offres visibles",
    );
  }

  if (input.captureDegraded) {
    pushPenalty(
      penalties,
      "capture_degraded",
      ext.capture_degraded,
      "major",
      undefined,
      "Qualité de capture faible",
    );
  }

  if (
    warnings.some((w) => w.includes("Ratio €/km inhabituel")) ||
    warnings.some((w) => w.includes("inhabituel"))
  ) {
    pushPenalty(
      penalties,
      "incoherent_values",
      ext.incoherent_values,
      "major",
      undefined,
      "Valeurs incohérentes",
    );
  }

  return penalties;
}

function computeCalculationPenalties(input: ReliabilityInput): ReliabilityPenalty[] {
  const { fields, offer, profile, economics } = input;
  const penalties: ReliabilityPenalty[] = [];
  const calc = cfg.calculation;

  if (offer.payout <= 0) return penalties;

  if (fields.durationMin.value == null) {
    const crit = fieldCriticalityForCalculation("durationMin", offer, profile);
    pushPenalty(
      penalties,
      "missing_duration",
      calc.missing_duration * crit,
      crit >= 0.85 ? "major" : "moderate",
      "durationMin",
    );
  }

  if (fields.distanceKm.value == null) {
    const crit = fieldCriticalityForCalculation("distanceKm", offer, profile);
    pushPenalty(
      penalties,
      "missing_distance",
      calc.missing_distance * crit,
      crit >= 0.85 ? "major" : "moderate",
      "distanceKm",
    );
  }

  if (fields.emptyReturnKm.value == null) {
    const crit = fieldCriticalityForCalculation("emptyReturnKm", offer, profile);
    pushPenalty(
      penalties,
      "missing_empty_return",
      calc.missing_empty_return * crit,
      "moderate",
      "emptyReturnKm",
    );
  }

  if (fields.pickupDistanceKm.value == null) {
    const crit = fieldCriticalityForCalculation("pickupDistanceKm", offer, profile);
    pushPenalty(
      penalties,
      "missing_pickup",
      calc.missing_pickup * crit,
      "minor",
      "pickupDistanceKm",
    );
  }

  const estimatedFields = (
    [
      ["distanceKm", fields.distanceKm],
      ["durationMin", fields.durationMin],
      ["emptyReturnKm", fields.emptyReturnKm],
      ["pickupDistanceKm", fields.pickupDistanceKm],
    ] as const
  ).filter(([, f]) => f.isEstimated && f.value != null);

  if (estimatedFields.length > 0) {
    const points = Math.min(
      calc.estimated_field_max,
      estimatedFields.length * calc.estimated_field,
    );
    pushPenalty(
      penalties,
      "estimated_fields",
      points,
      "moderate",
      undefined,
      estimatedFields.map(([name]) => name).join(", "),
    );
  }

  if (economics && economics.totalKm == null && economics.deliveryDistanceKm != null) {
    pushPenalty(
      penalties,
      "partial_total_km",
      calc.partial_total_km,
      "moderate",
      undefined,
      "Distance totale incomplète",
    );
  }

  if (fields.payout.value != null && fieldConfidencePct(fields.payout) < 70) {
    pushPenalty(
      penalties,
      "ambiguous_critical_field",
      calc.ambiguous_critical_field,
      "major",
      "payout",
    );
  }

  if (
    fields.distanceKm.value != null &&
    !fields.distanceKm.isEstimated &&
    fieldConfidencePct(fields.distanceKm) < 85
  ) {
    const crit = fieldCriticalityForCalculation("distanceKm", offer, profile);
    pushPenalty(
      penalties,
      "ambiguous_critical_field",
      calc.ambiguous_critical_field * crit,
      "moderate",
      "distanceKm",
    );
  }

  if (
    fields.durationMin.value != null &&
    !fields.durationMin.isEstimated &&
    fieldConfidencePct(fields.durationMin) < 85
  ) {
    const crit = fieldCriticalityForCalculation("durationMin", offer, profile);
    pushPenalty(
      penalties,
      "ambiguous_critical_field",
      calc.ambiguous_critical_field * crit,
      "moderate",
      "durationMin",
    );
  }

  if (fields.multipleOffersDetected) {
    pushPenalty(
      penalties,
      "multiple_offers",
      calc.multiple_offers,
      "major",
      undefined,
      "Plusieurs offres visibles",
    );
  }

  if (input.captureDegraded) {
    pushPenalty(
      penalties,
      "capture_degraded",
      calc.capture_degraded,
      "major",
      undefined,
      "Qualité de capture faible",
    );
  }

  return penalties;
}

/** Construit les champs structurés à partir d'une offre (tests / legacy). */
export function fieldsFromOffer(offer: RideOffer): StructuredVisionFields {
  const numField = (
    value: number | undefined,
    source: "vision" | "derived" | "unknown" = "vision",
    isEstimated = false,
  ) => ({
    value: value ?? null,
    confidence: value != null ? (isEstimated ? 0.65 : 0.95) : 0,
    source: value != null ? source : ("unknown" as const),
    isVisible: value != null,
    isEstimated,
  });

  return {
    platform: {
      value: offer.platform,
      confidence: 0.9,
      source: "vision",
      isVisible: true,
      isEstimated: false,
    },
    pickup: {
      value: offer.pickup,
      confidence: offer.pickup ? 0.9 : 0,
      source: offer.pickup ? "vision" : "unknown",
      isVisible: Boolean(offer.pickup),
      isEstimated: false,
    },
    dropoff: {
      value: offer.dropoff,
      confidence: offer.dropoff ? 0.9 : 0,
      source: offer.dropoff ? "vision" : "unknown",
      isVisible: Boolean(offer.dropoff),
      isEstimated: false,
    },
    payout: {
      value: offer.payout > 0 ? offer.payout : null,
      confidence: offer.payout > 0 ? 0.98 : 0,
      source: offer.payout > 0 ? "vision" : "unknown",
      isVisible: offer.payout > 0,
      isEstimated: false,
    },
    distanceKm: numField(offer.distanceKm),
    durationMin: numField(offer.durationMin),
    emptyReturnKm: numField(offer.emptyReturnKm),
    pickupDistanceKm: numField(offer.pickupDistanceKm),
    multipleOffersDetected: false,
    bonusIncluded: null,
  };
}

export function computeReliabilityScores(input: ReliabilityInput): ReliabilitySummary {
  const extractionPenalties = computeExtractionPenalties(input);
  let extractionScore = applyPenalties(100, extractionPenalties);

  if (input.extractionSource === "on_device_ocr") {
    extractionScore = clamp(extractionScore - 5, cfg.floor, 100);
  }

  const calculationPenalties = computeCalculationPenalties(input);
  const calculationScore = applyPenalties(100, calculationPenalties);

  const clarity = economicsClarityScore(input.offer, input.profile, {
    netGain: input.economics?.netGain ?? null,
    hourlyRate: input.economics?.hourlyRate ?? null,
    payoutPerKm: input.economics?.payoutPerKm ?? null,
  });

  const blend = cfg.decisionBlend;
  const decisionConfidence = clamp(
    Math.round(
      extractionScore * blend.extraction +
        calculationScore * blend.calculation +
        clarity * blend.clarity,
    ),
    cfg.floor,
    100,
  );

  const estimatedFields = (
    Object.entries(input.fields) as Array<
      [string, StructuredVisionFields[keyof StructuredVisionFields]]
    >
  )
    .filter(
      ([key, value]) =>
        key !== "multipleOffersDetected" &&
        key !== "bonusIncluded" &&
        typeof value === "object" &&
        value &&
        "isEstimated" in value &&
        value.isEstimated,
    )
    .map(([key]) => key);

  const blockingFields = input.offer.payout <= 0 ? ["payout"] : [];
  const cautionFields = [
    ...(input.fields.distanceKm.value == null ? ["distanceKm"] : []),
    ...(input.fields.durationMin.value == null ? ["durationMin"] : []),
    ...(input.fields.emptyReturnKm.value == null ? ["emptyReturnKm"] : []),
    ...(input.fields.pickupDistanceKm.value == null ? ["pickupDistanceKm"] : []),
    ...(input.fields.multipleOffersDetected ? ["multipleOffersDetected"] : []),
    ...estimatedFields,
  ];

  const state: ReliabilitySummary["state"] =
    blockingFields.length > 0
      ? "unsafe"
      : decisionConfidence >= 85 && extractionScore >= 88
        ? "complete"
        : decisionConfidence >= 55
          ? "partial"
          : "unsafe";

  return {
    state,
    confidence: decisionConfidence / 100,
    extractionScore,
    calculationScore,
    decisionConfidence,
    label: labelFromConfidence(decisionConfidence),
    penalties: [...extractionPenalties, ...calculationPenalties],
    blockingFields,
    cautionFields,
    estimatedFields,
  };
}
