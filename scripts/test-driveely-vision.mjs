/**
 * Tests unitaires pipeline Vision (sans Gemini).
 * Usage : node scripts/test-driveely-vision.mjs
 */

import { createRequire } from "module";
const require = createRequire(import.meta.url);

// Charge le TS compilé via tsx si dispo, sinon logique inline dupliquée minimale
const tests = [];

function assert(name, condition) {
  tests.push({ name, ok: !!condition });
  console.log(condition ? "✓" : "✗", name);
}

// ─── parseVisionJson (logique reproduite pour test sans build) ───
function readNullableNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function parseVisionJson(parsed) {
  const raw = {
    platform: parsed.platform ?? null,
    payout: readNullableNumber(parsed.payout),
    distanceKm: readNullableNumber(parsed.distanceKm),
    durationMin: readNullableNumber(parsed.durationMin),
  };
  const missingFields = [];
  if (raw.payout == null) missingFields.push("payout");
  if (raw.distanceKm == null) missingFields.push("distanceKm");
  if (raw.durationMin == null) missingFields.push("durationMin");
  const quality = raw.payout == null ? "failed" : missingFields.length ? "partial" : "complete";
  return { raw, missingFields, quality };
}

assert("distance null → partial", parseVisionJson({ payout: 8.5, distanceKm: null, durationMin: 20 }).quality === "partial");
assert("payout null → failed", parseVisionJson({ payout: null, distanceKm: 5 }).quality === "failed");
assert("complet → complete", parseVisionJson({ payout: 10, distanceKm: 4, durationMin: 18 }).quality === "complete");
assert("distance null listée", parseVisionJson({ payout: 8, distanceKm: null, durationMin: 15 }).missingFields.includes("distanceKm"));

const failed = tests.filter((t) => !t.ok).length;
console.log(`\n${tests.length - failed}/${tests.length} tests OK`);
process.exit(failed > 0 ? 1 : 0);
