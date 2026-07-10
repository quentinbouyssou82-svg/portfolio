/**
 * Tests résolution provider Vision + normalisation (sans appel API).
 * Usage : npx tsx scripts/test-uberly-vision-provider.ts
 */

import { resolveVisionProviderId } from "../lib/margeo/vision/providers/resolve";
import { normalizeVisionExtraction } from "../lib/margeo/vision/normalize-vision-result";

const tests: { name: string; ok: boolean }[] = [];

function assert(name: string, condition: boolean) {
  tests.push({ name, ok: condition });
  console.log(condition ? "✓" : "✗", name);
}

const saved = { ...process.env };

process.env.UBERLY_VISION_PROVIDER = "mistral";
process.env.MISTRAL_API_KEY = "test-key";
delete process.env.UBERLY_GEMINI_API_KEY;
assert(
  "UBERLY_VISION_PROVIDER=mistral → mistral",
  resolveVisionProviderId("auto") === "mistral",
);

process.env.UBERLY_VISION_PROVIDER = "gemini";
process.env.UBERLY_GEMINI_API_KEY = "gemini-key";
delete process.env.MISTRAL_API_KEY;
assert(
  "UBERLY_VISION_PROVIDER=gemini → gemini",
  resolveVisionProviderId("auto") === "gemini",
);

delete process.env.UBERLY_VISION_PROVIDER;
process.env.MISTRAL_API_KEY = "test-key";
assert(
  "auto sans env → mistral si MISTRAL_API_KEY",
  resolveVisionProviderId("auto") === "mistral",
);

Object.assign(process.env, saved);

const result = normalizeVisionExtraction(
  {
    platform: "Uber Eats",
    pickup: "McDo",
    dropoff: "Lyon 3",
    payout: 9.5,
    distanceKm: 4.2,
    durationMin: 18,
    emptyReturnKm: 0,
  },
  { durationMs: 420, provider: "mistral" },
);

assert("normalise payout", result.offer.payout === 9.5);
assert("normalise platform", result.offer.platform === "Uber Eats");
assert("extractionQuality complete", result.extractionQuality === "complete");
assert("visionProvider mistral", result.visionProvider === "mistral");
assert("visionDurationMs", result.visionDurationMs === 420);

const failed = tests.filter((t) => !t.ok).length;
console.log(`\n${tests.length - failed}/${tests.length} tests OK`);
process.exit(failed > 0 ? 1 : 0);
