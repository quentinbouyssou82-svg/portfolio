import { logBetaEvent } from "./beta-events";

/** Métriques OCR anonymisées — jamais d'image ni montants. */
export async function logOcrResolutionEvent(input: {
  userId: string;
  platform: string;
  clientConfidence: number;
  verdict?: string;
  usedOnDevice: boolean;
  analysisId?: string;
  /** accept | revalidate | reject (côté serveur) */
  trustAction?: string;
  trustReason?: string;
}): Promise<void> {
  await logBetaEvent({
    userId: input.userId,
    eventType: "ocr_resolution",
    analysisId: input.analysisId,
    visionSource: input.usedOnDevice ? "on_device_ocr" : "vision",
    visionConfidence: input.clientConfidence / 100,
    metadata: {
      platform: input.platform,
      clientConfidence: input.clientConfidence,
      usedOnDevice: input.usedOnDevice,
      verdict: input.verdict,
      trustAction: input.trustAction,
      trustReason: input.trustReason,
    },
  });
}
