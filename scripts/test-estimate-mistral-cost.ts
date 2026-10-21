/**
 * Tests estimation coût Mistral sur échec Vision.
 * Usage : npx tsx scripts/test-estimate-mistral-cost.ts
 */

import { estimateMistralVisionCost } from "../lib/margeo/vision/estimate-mistral-cost";

const est = estimateMistralVisionCost({
  model: "mistral-small-latest",
  preparedImageBytes: 320_000,
});

const ok =
  est.estimatedInputTokens > 0 &&
  est.estimatedCostEur >= 0 &&
  est.estimatedTotalTokens === est.estimatedInputTokens + est.estimatedOutputTokens;

console.log(est);
console.log(ok ? "✓ estimate ok" : "✗ estimate failed");
process.exit(ok ? 0 : 1);
