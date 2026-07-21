import type { PreparedImage } from "../prepare-image";

export type VisionProviderId = "mistral" | "gemini" | "mock";

export interface VisionProviderResult {
  rawJson: Record<string, unknown>;
  durationMs: number;
  provider: VisionProviderId;
}

export interface VisionProvider {
  id: VisionProviderId;
  analyzeImage(
    image: File | Blob | ArrayBuffer | Buffer | PreparedImage,
  ): Promise<VisionProviderResult>;
}

export interface NormalizedVisionResult {
  offer: import("../../types").RideOffer;
  confidence: number;
  warnings: string[];
  missingFields: string[];
  extractionQuality: import("../extraction-types").ExtractionQuality;
  visionDurationMs: number;
  visionProvider: VisionProviderId;
}
