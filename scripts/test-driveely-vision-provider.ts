/**
 * Tests résolution provider Vision + normalisation (sans appel API).
 * Usage : npx tsx scripts/test-driveely-vision-provider.ts
 */

import { resolveVisionProviderId } from "../lib/margeo/vision/providers/resolve";
import { normalizeVisionExtraction } from "../lib/margeo/vision/normalize-vision-result";

const tests: { name: string; ok: boolean }[] = [];

function assert(name: string, condition: boolean) {
  tests.push({ name, ok: condition });
  console.log(condition ? "✓" : "✗", name);
}

const saved = { ...process.env };

process.env.DRIVEELY_VISION_PROVIDER = "mistral";
process.env.MISTRAL_API_KEY = "test-key";
delete process.env.DRIVEELY_GEMINI_API_KEY;
delete process.env.DRIVEELY_GROQ_API_KEY;
delete process.env.GROQ_API_KEY;
assert(
  "DRIVEELY_VISION_PROVIDER=mistral → mistral",
  resolveVisionProviderId("auto") === "mistral",
);

process.env.DRIVEELY_VISION_PROVIDER = "groq";
process.env.DRIVEELY_GROQ_API_KEY = "gsk_test";
delete process.env.MISTRAL_API_KEY;
assert(
  "DRIVEELY_VISION_PROVIDER=groq → groq",
  resolveVisionProviderId("auto") === "groq",
);

process.env.DRIVEELY_VISION_PROVIDER = "gemini";
process.env.DRIVEELY_GEMINI_API_KEY = "gemini-key";
delete process.env.DRIVEELY_GROQ_API_KEY;
assert(
  "DRIVEELY_VISION_PROVIDER=gemini → gemini",
  resolveVisionProviderId("auto") === "gemini",
);

delete process.env.DRIVEELY_VISION_PROVIDER;
process.env.MISTRAL_API_KEY = "test-key";
assert(
  "auto sans env → mistral si MISTRAL_API_KEY",
  resolveVisionProviderId("auto") === "mistral",
);

delete process.env.MISTRAL_API_KEY;
process.env.DRIVEELY_GROQ_API_KEY = "gsk_test";
assert(
  "auto → groq si seule clé Groq",
  resolveVisionProviderId("auto") === "groq",
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

const groqNorm = normalizeVisionExtraction(
  {
    platform: "Deliveroo",
    pickup: "A",
    dropoff: "B",
    payout: 7,
    distanceKm: 3,
    durationMin: 12,
    emptyReturnKm: 0,
  },
  { durationMs: 100, provider: "groq" },
);
assert("visionProvider groq", groqNorm.visionProvider === "groq");

const failed = tests.filter((t) => !t.ok).length;
console.log(`\n${tests.length - failed}/${tests.length} tests OK`);
process.exit(failed > 0 ? 1 : 0);
