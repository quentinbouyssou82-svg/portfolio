import type { ExtractionQuality } from "../extraction-types";
import type { RideOffer } from "../../types";

export type VisionProviderId = "mistral" | "gemini" | "mock";

export interface VisionProviderResult {
  rawJson: Record<string, unknown>;
  durationMs: number;
  provider: VisionProviderId;
}

export interface VisionProvider {
  id: VisionProviderId;
  analyzeImage(
    image: File | Blob | ArrayBuffer,
  ): Promise<VisionProviderResult>;
}

export interface NormalizedVisionResult {
  offer: RideOffer;
  confidence: number;
  warnings: string[];
  missingFields: string[];
  extractionQuality: ExtractionQuality;
  visionDurationMs: number;
  visionProvider: VisionProviderId;
}
