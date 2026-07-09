import type { Platform, RideOffer } from "../types";
import type { ExtractionQuality } from "./extraction-types";
import type { ParsedVisionExtraction } from "./parse-vision-response";
import { normalizePlatform } from "./parse-vision-response";

export interface OfferValidation {
  offer: RideOffer;
  confidence: number;
  warnings: string[];
  missingFields: string[];
  extractionQuality: ExtractionQuality;
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
): OfferValidation {
  const { raw, missingFields, quality } = parsed;
  const warnings: string[] = [];
  let confidence = quality === "failed" ? 0.2 : quality === "partial" ? 0.65 : 0.92;

  const platform = PLATFORMS.includes(normalizePlatform(raw.platform))
    ? normalizePlatform(raw.platform)
    : "Autre";

  if (missingFields.includes("platform")) {
    warnings.push("Plateforme non identifiée sur la capture.");
    confidence -= 0.08;
  }

  const payout =
    raw.payout != null ? clamp(raw.payout, 0, 500) : undefined;
  if (payout == null) {
    warnings.push("Montant illisible — reprends une capture plus nette.");
    confidence -= 0.4;
  } else if (payout < 2) {
    warnings.push("Montant très bas — vérifie l'extraction.");
    confidence -= 0.12;
  }

  const distanceKm =
    raw.distanceKm != null ? clamp(raw.distanceKm, 0.1, 150) : undefined;
  if (distanceKm == null) {
    warnings.push("Distance non lue — le score sera moins précis.");
    confidence -= 0.18;
  }

  const durationMin =
    raw.durationMin != null
      ? clamp(Math.round(raw.durationMin), 5, 240)
      : undefined;
  if (durationMin == null) {
    warnings.push("Durée non lue — le €/h sera approximatif.");
    confidence -= 0.15;
  }

  const emptyReturnKm =
    raw.emptyReturnKm != null ? clamp(raw.emptyReturnKm, 0, 50) : 0;

  const pickup = raw.pickup?.trim() || undefined;
  const dropoff = raw.dropoff?.trim() || undefined;

  if (!pickup) {
    warnings.push("Lieu de récupération non identifié.");
    confidence -= 0.1;
  }
  if (!dropoff) {
    warnings.push("Destination non identifiée.");
    confidence -= 0.05;
  }

  if (
    payout != null &&
    distanceKm != null &&
    payout / Math.max(distanceKm, 0.5) > 8
  ) {
    warnings.push("Ratio €/km inhabituel — vérifie les valeurs.");
    confidence -= 0.15;
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
  };

  return {
    offer,
    confidence: clamp(Math.round(confidence * 100) / 100, 0, 1),
    warnings,
    missingFields,
    extractionQuality: quality,
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
      emptyReturnKm: raw.emptyReturnKm,
    },
    missingFields: [],
    quality: "complete",
  });
}
