import type { Platform } from "../types";

/** Réponse brute Gemini — null si illisible (ne pas inventer). */
export interface VisionExtractionRaw {
  platform: Platform | string | null;
  pickup: string | null;
  dropoff: string | null;
  payout: number | null;
  distanceKm: number | null;
  durationMin: number | null;
  emptyReturnKm: number | null;
}

export type ExtractionQuality = "complete" | "partial" | "failed";

export interface ParsedVisionExtraction {
  raw: VisionExtractionRaw;
  missingFields: string[];
  quality: ExtractionQuality;
}
