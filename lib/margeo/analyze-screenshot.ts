import type { Platform, RideOffer } from "./types";
import { validateCompleteOffer, validateExtractedOffer } from "./vision/validate-offer";
import type { ExtractionQuality } from "./vision/extraction-types";
import { hashImage } from "./vision/image-encoding";
import { normalizeVisionExtraction } from "./vision/normalize-vision-result";
import type { PreparedImage } from "./vision/prepare-image";
import { parseOnDeviceOcrPayload } from "./vision/parse-on-device-payload";
import {
  getVisionProvider,
  isMockVisionAllowed,
  isVisionProviderConfigured,
  resolveVisionProviderId,
  VISION_FAILOVER_ORDER,
} from "./vision/providers/resolve";
import type { VisionProviderId } from "./vision/providers/types";
import {
  getVisionCacheAsync,
  setVisionCacheAsync,
} from "./vision/vision-cache";
import {
  acquireVisionSlot,
  releaseVisionSlot,
} from "./queue/vision-concurrency";

export type ScreenshotAnalysisSource = "mock" | "vision" | "on_device_ocr";

export interface ScreenshotAnalysisResult {
  offer: RideOffer;
  fields: import("./vision/extraction-types").StructuredVisionFields;
  source: ScreenshotAnalysisSource;
  confidence: number;
  warnings: string[];
  missingFields: string[];
  extractionQuality: ExtractionQuality;
  reliability: import("./vision/extraction-types").ReliabilitySummary;
  visionDurationMs?: number;
  parseMs?: number;
  visionProvider?: VisionProviderId;
  visionRetries?: number;
  /** true si servi depuis le cache (Redis ou RAM) */
  fromCache?: boolean;
  clientOcrConfidence?: number;
  /** @deprecated */
  geminiDurationMs?: number;
}

export interface AnalyzeScreenshotOptions {
  seed?: number;
  provider?: "mock" | "vision" | "auto";
  /** Hash du contenu préparé — active le cache Vision */
  contentHash?: string;
}

/** Analyse depuis payload OCR iOS — saute l'appel Mistral. */
export async function analyzeFromOnDeviceOcr(
  payloadJson: string,
): Promise<ScreenshotAnalysisResult> {
  const parseStarted = Date.now();
  const { parsed, clientConfidence } = parseOnDeviceOcrPayload(payloadJson);
  const validated = validateExtractedOffer(parsed, undefined, {
    extractionSource: "on_device_ocr",
  });
  const parseMs = Date.now() - parseStarted;

  return {
    offer: validated.offer,
    fields: validated.fields,
    source: "on_device_ocr",
    confidence: validated.confidence,
    warnings: [
      ...validated.warnings,
      "Extraction locale (OCR iPhone) — fiabilité légèrement réduite.",
    ],
    missingFields: validated.missingFields,
    extractionQuality: validated.extractionQuality,
    reliability: validated.reliability,
    visionDurationMs: 0,
    parseMs,
    visionProvider: undefined,
    visionRetries: 0,
    clientOcrConfidence: clientConfidence,
  };
}

export async function analyzeScreenshot(
  image: File | Blob | ArrayBuffer | PreparedImage,
  options: AnalyzeScreenshotOptions = {},
): Promise<ScreenshotAnalysisResult> {
  const requestedMode =
    options.provider ??
    (process.env.DRIVEELY_VISION_PROVIDER === "mock" ? "mock" : "auto");
  // Le mock ne doit jamais répondre en production (voir isMockVisionAllowed).
  const mode = requestedMode === "mock" && !isMockVisionAllowed() ? "auto" : requestedMode;

  if (mode === "mock") {
    return analyzeWithMock(image, options.seed);
  }

  if (options.contentHash) {
    const cached = await getVisionCacheAsync(options.contentHash);
    if (cached) {
      return {
        ...cached,
        fromCache: true,
        visionDurationMs: 0,
        parseMs: 0,
        visionRetries: 0,
      };
    }
  }

  const slot = await acquireVisionSlot();
  if (!slot.acquired) {
    throw new Error(
      "Analyse IA saturée temporairement. Réessaie dans quelques secondes.",
    );
  }

  try {
    const result = await analyzeWithVisionProvider(image);
    if (options.contentHash && result.extractionQuality !== "failed") {
      await setVisionCacheAsync(options.contentHash, result);
    }
    return result;
  } catch (e) {
    console.error("[driveely] Vision failed:", e);
    const message =
      e instanceof Error ? e.message : "Analyse IA indisponible.";
    if (process.env.NODE_ENV === "development") {
      return analyzeWithMock(image, options.seed);
    }
    throw new Error(
      message.includes("Mistral") ? message : `Analyse IA : ${message}`,
    );
  } finally {
    await releaseVisionSlot();
  }
}

function isTransientVisionError(message: string): boolean {
  return (
    /429|rate[_ ]?limit/i.test(message) ||
    /timeout|abort|délai dépassé/i.test(message) ||
    /5\d\d/.test(message) ||
    /404|model_not_found|does not exist|do not have access/i.test(message) ||
    /ECONNRESET|ETIMEDOUT|fetch failed/i.test(message) ||
    /saturat/i.test(message)
  );
}

function visionProviderChain(primary: VisionProviderId): VisionProviderId[] {
  const ordered = [
    primary,
    ...VISION_FAILOVER_ORDER.filter((id) => id !== primary),
  ];
  return ordered.filter((id) => isVisionProviderConfigured(id));
}

async function analyzeWithVisionProvider(
  image: File | Blob | ArrayBuffer | PreparedImage,
): Promise<ScreenshotAnalysisResult> {
  const primary = resolveVisionProviderId("auto");
  const chain = visionProviderChain(primary);
  if (chain.length === 0) {
    throw new Error(
      "Analyse IA non configurée. Définis MISTRAL_API_KEY, DRIVEELY_GROQ_API_KEY ou DRIVEELY_GEMINI_API_KEY.",
    );
  }

  let lastError: Error | null = null;
  let attempts = 0;

  for (const providerId of chain) {
    const provider = getVisionProvider(providerId);
    if (!provider) continue;
    attempts += 1;
    try {
      const result = await provider.analyzeImage(image);
      const parseStarted = Date.now();
      const normalized = normalizeVisionExtraction(result.rawJson, {
        durationMs: result.durationMs,
        provider: result.provider,
      });
      const parseMs = Date.now() - parseStarted;

      return {
        offer: normalized.offer,
        fields: normalized.fields,
        source: "vision",
        confidence: normalized.confidence,
        warnings: normalized.warnings,
        missingFields: normalized.missingFields,
        extractionQuality: normalized.extractionQuality,
        reliability: normalized.reliability,
        visionDurationMs: normalized.visionDurationMs,
        parseMs,
        visionProvider: normalized.visionProvider,
        visionRetries: Math.max(0, attempts - 1),
        geminiDurationMs: normalized.visionDurationMs,
      };
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      lastError = e instanceof Error ? e : new Error(message);
      const canFailover =
        providerId !== chain[chain.length - 1] &&
        isTransientVisionError(message);
      console.warn("[driveely] Vision provider failed", {
        providerId,
        canFailover,
        message: message.slice(0, 200),
      });
      if (!canFailover) break;
    }
  }

  throw lastError ?? new Error("Analyse IA indisponible.");
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
    fields: validated.fields,
    source: "mock",
    confidence: Math.min(validated.confidence, 0.85),
    warnings: validated.warnings,
    missingFields: validated.missingFields,
    extractionQuality: validated.extractionQuality,
    reliability: validated.reliability,
  };
}
