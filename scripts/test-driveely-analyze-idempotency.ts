/**
 * Smoke idempotence analyse (RAM path, sans Redis requis).
 * Usage: npx tsx scripts/test-driveely-analyze-idempotency.ts
 */

import assert from "node:assert/strict";
import {
  getAnalyzeIdempotentResponse,
  setAnalyzeIdempotentResponse,
  type AnalyzeSuccessPayload,
} from "../lib/margeo/services/analyze-idempotency";

const sample: AnalyzeSuccessPayload = {
  analysis: {
    id: "a1",
    offer: {
      id: "r1",
      platform: "Uber Eats",
      pickup: "A",
      dropoff: "B",
      payout: 8.5,
    },
    analyzedAt: new Date().toISOString(),
    grossGain: 8.5,
    estimatedCost: 2,
    netGain: 6.5,
    hourlyRate: 18,
    score: 72,
    verdict: "go",
    explanation: "ok",
    insights: [],
    scoreBreakdown: [],
  },
  source: "vision",
  confidence: 0.9,
  warnings: [],
  missingFields: [],
  extractionQuality: "complete",
  extractionFields: {} as AnalyzeSuccessPayload["extractionFields"],
  reliability: undefined,
  fromCache: false,
  quota: { premium: false, remainingToday: 4, dailyLimit: 5 },
  timings: { total: 1200 },
};

async function main() {
  const userId = "user-idem-test";
  const hash = "hash-abc";

  assert.equal(await getAnalyzeIdempotentResponse(userId, hash), null);

  await setAnalyzeIdempotentResponse(userId, hash, sample);
  const replay = await getAnalyzeIdempotentResponse(userId, hash);
  assert.ok(replay);
  assert.equal(replay.analysis.id, "a1");
  assert.equal(replay.idempotentReplay, true);
  assert.equal(replay.fromCache, true);
  assert.equal(replay.analysis.score, 72);

  // Autre hash → miss
  assert.equal(await getAnalyzeIdempotentResponse(userId, "other"), null);

  console.log("✓ analyze idempotency RAM OK");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
