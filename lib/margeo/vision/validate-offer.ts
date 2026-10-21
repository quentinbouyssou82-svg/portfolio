import type { Platform, RideOffer, UserProfile } from "../types";
import type {
  ExtractionQuality,
  ParsedVisionExtraction,
  ReliabilitySummary,
  StructuredVisionFields,
} from "./extraction-types";
import { normalizePlatform } from "./parse-vision-response";
import { computeReliabilityScores } from "../reliability/compute";

export interface OfferValidation {
  offer: RideOffer;
  fields: StructuredVisionFields;
  confidence: number;
  warnings: string[];
  missingFields: string[];
  extractionQuality: ExtractionQuality;
  reliability: ReliabilitySummary;
}

const PLATFORMS: Platform[] = [
  "Uber Eats",
  "Deliveroo",
  "Stuart",
  "Amazon Flex",
  "Autre",
];

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/**
 * Valide une extraction Vision sans inventer de valeurs manquantes.
 * Les champs null restent absents de l'offre — le moteur adapte le scoring.
 */
export function validateExtractedOffer(
  parsed: ParsedVisionExtraction,
  profile?: UserProfile,
  options?: { extractionSource?: "vision" | "on_device_ocr" },
): OfferValidation {
  const { raw, fields, missingFields, quality } = parsed;
  const warnings: string[] = [];

  const platform = PLATFORMS.includes(normalizePlatform(raw.platform))
    ? normalizePlatform(raw.platform)
    : "Autre";

  if (missingFields.includes("platform")) {
    warnings.push("Plateforme non identifiée sur la capture.");
  }

  const payout =
    raw.payout != null ? clamp(raw.payout, 0, 500) : undefined;
  if (payout == null) {
    warnings.push("Montant illisible — reprends une capture plus nette.");
  } else if (payout < 2) {
    warnings.push("Montant très bas — vérifie l'extraction.");
  }

  const distanceKm =
    raw.distanceKm != null ? clamp(raw.distanceKm, 0.1, 150) : undefined;
  if (distanceKm == null) {
    warnings.push("Distance non lue — le score sera moins précis.");
  }

  const durationMin =
    raw.durationMin != null
      ? clamp(Math.round(raw.durationMin), 5, 240)
      : undefined;
  if (durationMin == null) {
    warnings.push("Durée non lue — le €/h sera approximatif.");
  }

  const emptyReturnKm =
    raw.emptyReturnKm != null ? clamp(raw.emptyReturnKm, 0, 50) : undefined;
  if (emptyReturnKm == null) {
    warnings.push("Retour à vide inconnu — aucune hypothèse automatique.");
  }

  const pickupDistanceKm =
    raw.pickupDistanceKm != null ? clamp(raw.pickupDistanceKm, 0, 50) : undefined;

  const pickup = raw.pickup?.trim() || undefined;
  const dropoff = raw.dropoff?.trim() || undefined;

  if (!pickup) {
    warnings.push("Lieu de récupération non identifié.");
  }
  if (!dropoff) {
    warnings.push("Destination non identifiée.");
  }

  if (fields.multipleOffersDetected) {
    warnings.push("Plusieurs offres détectées sur la capture.");
  }

  if (
    payout != null &&
    distanceKm != null &&
    payout / Math.max(distanceKm, 0.5) > 8
  ) {
    warnings.push("Ratio €/km inhabituel — vérifie les valeurs.");
  }

  const offer: RideOffer = {
    id: crypto.randomUUID(),
    platform,
    pickup: pickup ?? "Non identifié",
    dropoff: dropoff ?? "Non identifié",
    payout: payout ?? 0,
    distanceKm,
    durationMin,
    emptyReturnKm,
    pickupDistanceKm,
  };

  const defaultProfile: UserProfile = profile ?? {
    name: "Audit",
    firstName: "Audit",
    lastName: "Test",
    city: "Lyon",
    vehicle: "scooter_thermique",
    costPerKm: 0.18,
    targetHourly: 18,
    dailyTarget: 120,
    platforms: ["Uber Eats"],
    premium: true,
    minBenefit: 6,
    maxDistanceKm: 8,
    emptyReturns: "short_only",
  };

  const reliability: ReliabilitySummary = computeReliabilityScores({
    fields,
    offer,
    profile: defaultProfile,
    warnings,
    economics: null,
    extractionSource: options?.extractionSource ?? "vision",
  });

  return {
    offer,
    fields,
    confidence: reliability.decisionConfidence / 100,
    warnings,
    missingFields,
    extractionQuality: quality,
    reliability,
  };
}

/** Valide une offre mock complète (tests / dev). */
export function validateCompleteOffer(raw: RideOffer): OfferValidation {
  return validateExtractedOffer({
    raw: {
      platform: raw.platform,
      pickup: raw.pickup,
      dropoff: raw.dropoff,
      payout: raw.payout,
      distanceKm: raw.distanceKm ?? null,
      durationMin: raw.durationMin ?? null,
      emptyReturnKm: raw.emptyReturnKm ?? null,
      pickupDistanceKm: raw.pickupDistanceKm ?? null,
    },
    missingFields: [],
    fields: {
      platform: {
        value: raw.platform,
        confidence: 1,
        source: "vision",
        isVisible: true,
        isEstimated: false,
      },
      pickup: {
        value: raw.pickup,
        confidence: 1,
        source: "vision",
        isVisible: true,
        isEstimated: false,
      },
      dropoff: {
        value: raw.dropoff,
        confidence: 1,
        source: "vision",
        isVisible: true,
        isEstimated: false,
      },
      payout: {
        value: raw.payout,
        confidence: 1,
        source: "vision",
        isVisible: true,
        isEstimated: false,
      },
      distanceKm: {
        value: raw.distanceKm ?? null,
        confidence: raw.distanceKm != null ? 1 : 0,
        source: raw.distanceKm != null ? "vision" : "unknown",
        isVisible: raw.distanceKm != null,
        isEstimated: false,
      },
      durationMin: {
        value: raw.durationMin ?? null,
        confidence: raw.durationMin != null ? 1 : 0,
        source: raw.durationMin != null ? "vision" : "unknown",
        isVisible: raw.durationMin != null,
        isEstimated: false,
      },
      emptyReturnKm: {
        value: raw.emptyReturnKm ?? null,
        confidence: raw.emptyReturnKm != null ? 1 : 0,
        source: raw.emptyReturnKm != null ? "vision" : "unknown",
        isVisible: raw.emptyReturnKm != null,
        isEstimated: false,
      },
      pickupDistanceKm: {
        value: raw.pickupDistanceKm ?? null,
        confidence: raw.pickupDistanceKm != null ? 1 : 0,
        source: raw.pickupDistanceKm != null ? "vision" : "unknown",
        isVisible: raw.pickupDistanceKm != null,
        isEstimated: false,
      },
      multipleOffersDetected: false,
      bonusIncluded: null,
    },
    quality: "complete",
  });
}
