import { parseVisionJson } from "./parse-vision-response";
import { validateExtractedOffer } from "./validate-offer";
import type { NormalizedVisionResult } from "./providers/types";
import type { VisionProviderId } from "./providers/types";

export function normalizeVisionExtraction(
  rawJson: Record<string, unknown>,
  opts: { durationMs: number; provider: VisionProviderId },
): NormalizedVisionResult {
  const vision = parseVisionJson(rawJson);
  const validated = validateExtractedOffer(vision);

  return {
    offer: validated.offer,
    confidence: validated.confidence,
    warnings: validated.warnings,
    missingFields: validated.missingFields,
    extractionQuality: validated.extractionQuality,
    visionDurationMs: opts.durationMs,
    visionProvider: opts.provider,
  };
}
