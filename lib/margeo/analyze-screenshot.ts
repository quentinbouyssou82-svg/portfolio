import type { Platform, RideOffer } from "./types";
import { validateCompleteOffer } from "./vision/validate-offer";
import type { ExtractionQuality } from "./vision/extraction-types";
import { hashImage } from "./vision/image-encoding";
import { normalizeVisionExtraction } from "./vision/normalize-vision-result";
import type { PreparedImage } from "./vision/prepare-image";
import {
  getVisionProvider,
  resolveVisionProviderId,
} from "./vision/providers/resolve";
import type { VisionProviderId } from "./vision/providers/types";
import { getVisionCache, setVisionCache } from "./vision/vision-cache";

export type ScreenshotAnalysisSource = "mock" | "vision";

export interface ScreenshotAnalysisResult {
  offer: RideOffer;
  source: ScreenshotAnalysisSource;
  confidence: number;
  warnings: string[];
  missingFields: string[];
  extractionQuality: ExtractionQuality;
  visionDurationMs?: number;
  visionProvider?: VisionProviderId;
  /** true si servi depuis le cache mémoire */
  fromCache?: boolean;
  /** @deprecated */
  geminiDurationMs?: number;
}

export interface AnalyzeScreenshotOptions {
  seed?: number;
  provider?: "mock" | "vision" | "auto";
  /** Hash du contenu préparé — active le cache Vision */
  contentHash?: string;
}

export async function analyzeScreenshot(
  image: File | Blob | ArrayBuffer | PreparedImage,
  options: AnalyzeScreenshotOptions = {},
): Promise<ScreenshotAnalysisResult> {
  const mode =
    options.provider ??
    (process.env.UBERLY_VISION_PROVIDER === "mock" ? "mock" : "auto");

  if (mode === "mock") {
    return analyzeWithMock(image, options.seed);
  }

  if (options.contentHash) {
    const cached = getVisionCache(options.contentHash);
    if (cached) {
      return { ...cached, fromCache: true, visionDurationMs: 0 };
    }
  }

  try {
    const result = await analyzeWithVisionProvider(image);
    if (options.contentHash && result.extractionQuality !== "failed") {
      setVisionCache(options.contentHash, result);
    }
    return result;
  } catch (e) {
    console.error("[uberly] Vision failed:", e);
    const message =
      e instanceof Error ? e.message : "Analyse IA indisponible.";
    if (process.env.NODE_ENV === "development") {
      return analyzeWithMock(image, options.seed);
    }
    throw new Error(
      message.includes("Mistral") ? message : `Analyse IA : ${message}`,
    );
  }
}

async function analyzeWithVisionProvider(
  image: File | Blob | ArrayBuffer | PreparedImage,
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
  image: File | Blob | ArrayBuffer | PreparedImage,
  seed?: number,
): Promise<ScreenshotAnalysisResult> {
  await new Promise((r) => setTimeout(r, 20));
  const hashSeed =
    seed ??
    (image &&
    typeof image === "object" &&
    "preparedBytes" in image
      ? (image as PreparedImage).preparedBytes
      : hashImage(image as File | Blob | ArrayBuffer));
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
