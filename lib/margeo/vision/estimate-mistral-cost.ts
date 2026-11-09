/**
 * Estimation conservative du coût Mistral Vision sur échec (tokens déjà consommés côté provider).
 * Prix : À VÉRIFIER sur https://mistral.ai/pricing — override via env pour calibration.
 */

const PROMPT_CHARS = 1_800;
const CHARS_PER_TOKEN = 4;
const OUTPUT_TOKENS_ASSUMED = 140;

/** Heuristique vision : ~1 token par 750 octets JPEG préparé (conservateur). */
const IMAGE_BYTES_PER_TOKEN = 750;

export interface MistralCostEstimate {
  model: string;
  estimatedInputTokens: number;
  estimatedOutputTokens: number;
  estimatedTotalTokens: number;
  estimatedCostEur: number;
  pricingNote: string;
}

function inputPricePerMillionEur(): number {
  const raw = process.env.DRIVEELY_MISTRAL_INPUT_EUR_PER_M?.trim();
  if (raw) {
    const n = Number(raw);
    if (Number.isFinite(n) && n > 0) return n;
  }
  // Fallback documentaire — À VÉRIFIER sur dashboard Mistral
  return 0.15;
}

function outputPricePerMillionEur(): number {
  const raw = process.env.DRIVEELY_MISTRAL_OUTPUT_EUR_PER_M?.trim();
  if (raw) {
    const n = Number(raw);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return 0.15;
}

export function estimateMistralVisionCost(params: {
  model: string;
  preparedImageBytes: number;
  promptChars?: number;
}): MistralCostEstimate {
  const promptTokens = Math.ceil(
    (params.promptChars ?? PROMPT_CHARS) / CHARS_PER_TOKEN,
  );
  const imageTokens = Math.ceil(
    Math.max(params.preparedImageBytes, 0) / IMAGE_BYTES_PER_TOKEN,
  );
  const estimatedInputTokens = promptTokens + imageTokens;
  const estimatedOutputTokens = OUTPUT_TOKENS_ASSUMED;
  const estimatedTotalTokens = estimatedInputTokens + estimatedOutputTokens;

  const inputCost =
    (estimatedInputTokens / 1_000_000) * inputPricePerMillionEur();
  const outputCost =
    (estimatedOutputTokens / 1_000_000) * outputPricePerMillionEur();

  return {
    model: params.model,
    estimatedInputTokens,
    estimatedOutputTokens,
    estimatedTotalTokens,
    estimatedCostEur: Math.round((inputCost + outputCost) * 1_000_000) / 1_000_000,
    pricingNote:
      "Estimation — calibrer DRIVEELY_MISTRAL_INPUT_EUR_PER_M / OUTPUT_EUR_PER_M depuis dashboard Mistral",
  };
}
