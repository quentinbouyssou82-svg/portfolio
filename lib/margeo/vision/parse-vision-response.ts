import type { Platform } from "../types";
import type {
  ExtractionQuality,
  VisionExtractionRaw,
} from "./extraction-types";

export interface ParsedVisionExtraction {
  raw: VisionExtractionRaw;
  missingFields: string[];
  quality: ExtractionQuality;
}

function readNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
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
  };

  const missingFields: string[] = [];
  if (raw.payout == null) missingFields.push("payout");
  if (raw.distanceKm == null) missingFields.push("distanceKm");
  if (raw.durationMin == null) missingFields.push("durationMin");
  if (!raw.pickup) missingFields.push("pickup");
  if (!raw.dropoff) missingFields.push("dropoff");
  if (raw.platform == null) missingFields.push("platform");

  let quality: ParsedVisionExtraction["quality"] = "complete";
  if (raw.payout == null) {
    quality = "failed";
  } else if (missingFields.length > 0) {
    quality = "partial";
  }

  return { raw, missingFields, quality };
}
