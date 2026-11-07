import type { ScreenshotAnalysisSource } from "../analyze-screenshot";
import type { RideOffer, UserProfile } from "../types";

/** Valeurs toujours sûres même si un replica n'a pas encore le CHECK élargi. */
export type DbVisionSource = "mock" | "vision";
export type DbExtractionQuality = "complete" | "partial" | "failed";

export function dbVisionSource(
  source?: ScreenshotAnalysisSource | string | null,
): DbVisionSource | null {
  if (source === "mock") return "mock";
  if (source === "vision" || source === "on_device_ocr") return "vision";
  return null;
}

/** `unsafe` (km/durée manquants) n'est pas dans le CHECK prod → `partial`. */
export function dbExtractionQuality(
  quality?: string | null,
): DbExtractionQuality {
  if (quality === "failed") return "failed";
  if (quality === "complete") return "complete";
  return "partial";
}

function finiteOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function finiteOrZero(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export type PersistRideOpts = {
  imagePath?: string | null;
  courierLat?: number;
  courierLng?: number;
  visionSource?: ScreenshotAnalysisSource;
  visionConfidence?: number;
  missingFields?: string[];
  extractionQuality?: string;
};

export type RideInsertPayload = {
  id: string;
  user_id: string;
  platform: string;
  pickup: string;
  dropoff: string;
  payout: number;
  distance_km: number | null;
  duration_min: number | null;
  empty_return_km: number;
  pickup_distance_km: number | null;
  courier_lat: number | null;
  courier_lng: number | null;
  image_path: string | null;
  vision_source: DbVisionSource | null;
  vision_confidence: number | null;
  missing_fields: string[];
  extraction_quality: DbExtractionQuality;
};

/** Payload ride compatible CHECK + colonnes nullable. */
export function buildRideInsertPayload(
  rideId: string,
  userId: string,
  offer: RideOffer,
  profile: UserProfile,
  opts?: PersistRideOpts,
): RideInsertPayload {
  const confidence = finiteOrNull(opts?.visionConfidence);
  return {
    id: rideId,
    user_id: userId,
    platform: offer.platform || "Autre",
    pickup: offer.pickup ?? "",
    dropoff: offer.dropoff ?? "",
    payout: finiteOrZero(offer.payout),
    distance_km: finiteOrNull(offer.distanceKm),
    duration_min: finiteOrNull(offer.durationMin),
    empty_return_km: finiteOrZero(offer.emptyReturnKm),
    pickup_distance_km: finiteOrNull(offer.pickupDistanceKm),
    courier_lat: finiteOrNull(opts?.courierLat ?? profile.lastLat),
    courier_lng: finiteOrNull(opts?.courierLng ?? profile.lastLng),
    image_path: opts?.imagePath ?? null,
    vision_source: dbVisionSource(opts?.visionSource),
    vision_confidence:
      confidence != null ? Math.min(1, Math.max(0, confidence)) : null,
    missing_fields: Array.isArray(opts?.missingFields) ? opts.missingFields : [],
    extraction_quality: dbExtractionQuality(opts?.extractionQuality),
  };
}

/** Si le schéma prod n'a pas encore les colonnes Vision / nullable km. */
export function buildRideInsertFallback(
  payload: RideInsertPayload,
): Record<string, unknown> {
  return {
    id: payload.id,
    user_id: payload.user_id,
    platform: payload.platform,
    pickup: payload.pickup,
    dropoff: payload.dropoff,
    payout: payload.payout,
    distance_km: payload.distance_km ?? 0,
    duration_min: payload.duration_min ?? 0,
    empty_return_km: payload.empty_return_km,
    image_path: payload.image_path,
  };
}

export function finiteMoney(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  return Math.round(value * 100) / 100;
}

export function finiteScore(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}
