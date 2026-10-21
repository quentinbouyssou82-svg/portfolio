import type { Platform } from "../types";
import type {
  ExtractionField,
  ExtractionQuality,
  ParsedVisionExtraction,
  VisionExtractionRaw,
} from "./extraction-types";

function readNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string") {
    // Groq/Mistral can return "12,45 €" / "7,4 km" — coerce FR locale.
    const cleaned = value
      .trim()
      .replace(/\s/g, "")
      .replace(/[€$£]/g, "")
      .replace(/km|min|mins?|minutes?/gi, "")
      .replace(",", ".");
    const match = cleaned.match(/-?\d+(?:\.\d+)?/);
    if (!match) return null;
    const n = Number(match[0]);
    return Number.isFinite(n) ? n : null;
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function readNullableString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  return s.length > 0 ? s : null;
}

export function normalizePlatform(value: string | null): Platform {
  if (!value) return "Autre";
  const v = value.toLowerCase();
  if (v.includes("uber")) return "Uber Eats";
  if (v.includes("deliveroo")) return "Deliveroo";
  if (v.includes("stuart")) return "Stuart";
  if (v.includes("amazon") || v.includes("flex")) return "Amazon Flex";
  return "Autre";
}

function field<T>(
  value: T | null,
  confidence: number,
  source: ExtractionField<T>["source"],
  isVisible: boolean,
  isEstimated = false,
): ExtractionField<T> {
  return { value, confidence, source, isVisible, isEstimated };
}

export function parseVisionJson(
  parsed: Record<string, unknown>,
): ParsedVisionExtraction {
  const raw: VisionExtractionRaw = {
    platform: readNullableString(parsed.platform),
    pickup: readNullableString(parsed.pickup),
    dropoff: readNullableString(parsed.dropoff),
    payout: readNullableNumber(parsed.payout),
    distanceKm: readNullableNumber(parsed.distanceKm),
    durationMin: readNullableNumber(parsed.durationMin),
    emptyReturnKm: readNullableNumber(parsed.emptyReturnKm),
    pickupDistanceKm: readNullableNumber(parsed.pickupDistanceKm),
    multipleOffersDetected:
      typeof parsed.multipleOffersDetected === "boolean"
        ? parsed.multipleOffersDetected
        : null,
    bonusIncluded:
      typeof parsed.bonusIncluded === "boolean" ? parsed.bonusIncluded : null,
  };

  const missingFields: string[] = [];
  if (raw.payout == null) missingFields.push("payout");
  if (raw.distanceKm == null) missingFields.push("distanceKm");
  if (raw.durationMin == null) missingFields.push("durationMin");
  if (!raw.pickup) missingFields.push("pickup");
  if (!raw.dropoff) missingFields.push("dropoff");
  if (raw.platform == null) missingFields.push("platform");

  let quality: ExtractionQuality = "complete";
  if (raw.payout == null) {
    quality = "failed";
  } else if (raw.distanceKm == null || raw.durationMin == null) {
    quality = "unsafe";
  } else if (missingFields.length > 0) {
    quality = "partial";
  }

  return {
    raw,
    fields: {
      platform: field(raw.platform, raw.platform ? 0.84 : 0, raw.platform ? "vision" : "unknown", raw.platform != null),
      pickup: field(raw.pickup, raw.pickup ? 0.86 : 0, raw.pickup ? "vision" : "unknown", raw.pickup != null),
      dropoff: field(raw.dropoff, raw.dropoff ? 0.86 : 0, raw.dropoff ? "vision" : "unknown", raw.dropoff != null),
      payout: field(raw.payout, raw.payout != null ? 0.98 : 0, raw.payout != null ? "vision" : "unknown", raw.payout != null),
      distanceKm: field(raw.distanceKm, raw.distanceKm != null ? 0.92 : 0, raw.distanceKm != null ? "vision" : "unknown", raw.distanceKm != null),
      durationMin: field(raw.durationMin, raw.durationMin != null ? 0.9 : 0, raw.durationMin != null ? "vision" : "unknown", raw.durationMin != null),
      emptyReturnKm: field(raw.emptyReturnKm, raw.emptyReturnKm != null ? 0.72 : 0, raw.emptyReturnKm != null ? "vision" : "unknown", raw.emptyReturnKm != null),
      pickupDistanceKm: field(raw.pickupDistanceKm ?? null, raw.pickupDistanceKm != null ? 0.65 : 0, raw.pickupDistanceKm != null ? "vision" : "unknown", raw.pickupDistanceKm != null),
      multipleOffersDetected: raw.multipleOffersDetected === true,
      bonusIncluded: raw.bonusIncluded ?? null,
    },
    missingFields,
    quality,
  };
}
