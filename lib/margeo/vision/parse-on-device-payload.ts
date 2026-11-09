import { parseVisionJson } from "./parse-vision-response";
import type { ParsedVisionExtraction } from "./extraction-types";

export interface OnDeviceOcrPayload {
  platform: string;
  price_eur?: number;
  payout?: number;
  distance_km?: number;
  distanceKm?: number;
  duration_min?: number;
  durationMin?: number;
  pickup_address?: string;
  pickup?: string;
  dropoff_address?: string;
  dropoff?: string;
  stops_count?: number;
  confidence?: number;
}

export function parseOnDeviceOcrPayload(raw: string): {
  parsed: ParsedVisionExtraction;
  clientConfidence: number;
} {
  let json: OnDeviceOcrPayload;
  try {
    json = JSON.parse(raw) as OnDeviceOcrPayload;
  } catch {
    throw new Error("Payload OCR local invalide (JSON)");
  }

  const normalized = {
    platform: json.platform,
    payout: json.price_eur ?? json.payout ?? null,
    distanceKm: json.distance_km ?? json.distanceKm ?? null,
    durationMin: json.duration_min ?? json.durationMin ?? null,
    pickup: json.pickup_address ?? json.pickup ?? null,
    dropoff: json.dropoff_address ?? json.dropoff ?? null,
    emptyReturnKm: null,
    pickupDistanceKm: null,
    multipleOffersDetected: (json.stops_count ?? 1) > 1,
    bonusIncluded: null,
  };

  const parsed = parseVisionJson(normalized);

  // Marquer champs comme source on_device_ocr
  const ocrSource = "on_device_ocr" as const;
  for (const key of Object.keys(parsed.fields) as (keyof typeof parsed.fields)[]) {
    const f = parsed.fields[key];
    if (f && typeof f === "object" && "source" in f && f.value != null) {
      (f as { source: string }).source = ocrSource;
    }
  }

  const clientConfidence =
    typeof json.confidence === "number" && Number.isFinite(json.confidence)
      ? Math.max(0, Math.min(100, json.confidence))
      : 0;

  return { parsed, clientConfidence };
}
