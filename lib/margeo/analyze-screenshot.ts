import type { Platform, RideOffer } from "./types";
import {
  validateCompleteOffer,
} from "./vision/validate-offer";
import type { ExtractionQuality } from "./vision/extraction-types";
import { hashImage } from "./vision/image-encoding";
import { normalizeVisionExtraction } from "./vision/normalize-vision-result";
import {
  getVisionProvider,
  resolveVisionProviderId,
} from "./vision/providers/resolve";
import type { VisionProviderId } from "./vision/providers/types";

export type ScreenshotAnalysisSource = "mock" | "vision";

export interface ScreenshotAnalysisResult {
  offer: RideOffer;
  source: ScreenshotAnalysisSource;
  confidence: number;
  warnings: string[];
  missingFields: string[];
  extractionQuality: ExtractionQuality;
  /** Durée appel Vision en ms (vision uniquement). */
  visionDurationMs?: number;
  /** Provider utilisé pour l'extraction (vision uniquement). */
  visionProvider?: VisionProviderId;
  /** @deprecated Utiliser visionDurationMs — conservé pour métadonnées beta existantes. */
  geminiDurationMs?: number;
}

export interface AnalyzeScreenshotOptions {
  seed?: number;
  provider?: "mock" | "vision" | "auto";
}

export async function analyzeScreenshot(
  image: File | Blob | ArrayBuffer,
  options: AnalyzeScreenshotOptions = {},
): Promise<ScreenshotAnalysisResult> {
  const mode =
    options.provider ??
    (process.env.UBERLY_VISION_PROVIDER === "mock" ? "mock" : "auto");

  if (mode === "mock") {
    return analyzeWithMock(image, options.seed);
  }

  try {
    return await analyzeWithVisionProvider(image);
  } catch (e) {
    console.error("[uberly] Vision failed:", e);
    if (process.env.NODE_ENV === "development") {
      return analyzeWithMock(image, options.seed);
    }
    throw e;
  }
}

async function analyzeWithVisionProvider(
  image: File | Blob | ArrayBuffer,
): Promise<ScreenshotAnalysisResult> {
  const providerId = resolveVisionProviderId("auto");
  const provider = getVisionProvider(providerId);

  if (!provider) {
    throw new Error(`Provider Vision inconnu : ${providerId}`);
  }

  const result = await provider.analyzeImage(image);
  const normalized = normalizeVisionExtraction(result.rawJson, {
    durationMs: result.durationMs,
    provider: result.provider,
  });

  return {
    offer: normalized.offer,
    source: "vision",
    confidence: normalized.confidence,
    warnings: normalized.warnings,
    missingFields: normalized.missingFields,
    extractionQuality: normalized.extractionQuality,
    visionDurationMs: normalized.visionDurationMs,
    visionProvider: normalized.visionProvider,
    geminiDurationMs: normalized.visionDurationMs,
  };
}

async function analyzeWithMock(
  image: File | Blob | ArrayBuffer,
  seed?: number,
): Promise<ScreenshotAnalysisResult> {
  await new Promise((r) => setTimeout(r, 80));
  const hashSeed = seed ?? hashImage(image);
  const mocks: Omit<RideOffer, "id">[] = [
    {
      platform: "Uber Eats" as Platform,
      pickup: "Five Guys, Confluence",
      dropoff: "Sainte-Foy-lès-Lyon",
      payout: 10.4,
      distanceKm: 6.1,
      durationMin: 26,
      emptyReturnKm: 2.1,
    },
    {
      platform: "Deliveroo",
      pickup: "Chez Antoinette, Terreaux",
      dropoff: "Caluire-et-Cuire",
      payout: 4.9,
      distanceKm: 5.4,
      durationMin: 27,
      emptyReturnKm: 3.2,
    },
    {
      platform: "Stuart",
      pickup: "Apple Store Part-Dieu",
      dropoff: "Préfecture",
      payout: 13.6,
      distanceKm: 3.1,
      durationMin: 17,
      emptyReturnKm: 0.7,
    },
  ];
  const index = Math.abs(hashSeed) % mocks.length;
  const validated = validateCompleteOffer({
    ...mocks[index],
    id: crypto.randomUUID(),
  });
  return {
    offer: validated.offer,
    source: "mock",
    confidence: Math.min(validated.confidence, 0.85),
    warnings: validated.warnings,
    missingFields: validated.missingFields,
    extractionQuality: validated.extractionQuality,
  };
}
