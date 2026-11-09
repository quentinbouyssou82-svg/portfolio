/**
 * Décision d'extraction pour /analyze.
 * Vision reste la source de vérité. L'OCR client n'est jamais fiable tout seul :
 * uniquement un fallback si resolveOcrTrust.useClientOcr (bound + preuves) ET Vision down.
 */

import type { OcrTrustDecision } from "./ocr-trust";

export type AnalyzeExtractionChoice = {
  useClientOcr: boolean;
  reason: string;
};

export function decideAnalyzeExtraction(input: {
  trust: Pick<OcrTrustDecision, "useClientOcr" | "reason">;
  visionOk: boolean;
  visionUnavailable: boolean;
}): AnalyzeExtractionChoice {
  if (input.visionOk) {
    return { useClientOcr: false, reason: "vision_preferred" };
  }

  if (!input.trust.useClientOcr) {
    return {
      useClientOcr: false,
      reason: input.trust.reason || "ocr_not_trusted",
    };
  }

  if (input.visionUnavailable) {
    return {
      useClientOcr: true,
      reason: "ocr_bound_fallback_vision_unavailable",
    };
  }

  return { useClientOcr: false, reason: "vision_failed_ocr_not_used" };
}

export function isVisionInfrastructureError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message;
  return (
    /rate[_ ]?limit|429/i.test(message) ||
    /Analyse IA|Vision|Mistral|Groq|Gemini|IMAGE_PIPELINE/i.test(message)
  );
}

export async function readFormText(
  form: FormData,
  key: string,
): Promise<string | null> {
  const value = form.get(key);
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (typeof File !== "undefined" && value instanceof File) {
    const trimmed = (await value.text()).trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  return null;
}
