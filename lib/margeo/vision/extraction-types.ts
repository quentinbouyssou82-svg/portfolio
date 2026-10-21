import type { Platform } from "../types";

export type ExtractionFieldSource =
  | "vision"
  | "on_device_ocr"
  | "derived"
  | "estimated"
  | "profile"
  | "default"
  | "unknown";

export interface ExtractionField<T> {
  value: T | null;
  confidence: number;
  source: ExtractionFieldSource;
  isVisible: boolean;
  isEstimated: boolean;
}

/** Réponse brute provider Vision — null si illisible (ne pas inventer). */
export interface VisionExtractionRaw {
  platform: Platform | string | null;
  pickup: string | null;
  dropoff: string | null;
  payout: number | null;
  distanceKm: number | null;
  durationMin: number | null;
  emptyReturnKm: number | null;
  pickupDistanceKm?: number | null;
  multipleOffersDetected?: boolean | null;
  bonusIncluded?: boolean | null;
}

export interface StructuredVisionFields {
  platform: ExtractionField<Platform | string>;
  pickup: ExtractionField<string>;
  dropoff: ExtractionField<string>;
  payout: ExtractionField<number>;
  distanceKm: ExtractionField<number>;
  durationMin: ExtractionField<number>;
  emptyReturnKm: ExtractionField<number>;
  pickupDistanceKm: ExtractionField<number>;
  multipleOffersDetected: boolean;
  bonusIncluded: boolean | null;
}

export type ExtractionQuality = "complete" | "partial" | "unsafe" | "failed";

export type {
  ReliabilityPenalty,
  ReliabilitySummary,
} from "../types";

export interface ParsedVisionExtraction {
  raw: VisionExtractionRaw;
  fields: StructuredVisionFields;
  missingFields: string[];
  quality: ExtractionQuality;
}
