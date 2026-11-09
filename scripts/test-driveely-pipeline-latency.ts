/**
 * Timeouts du pipeline analyse — sans appel réseau.
 * Usage: npx tsx scripts/test-driveely-pipeline-latency.ts
 */
import assert from "node:assert/strict";
import { ANALYZE_BUDGETS, withTimeout } from "../lib/margeo/pipeline-trace";
import { unknownPickupResult } from "../lib/margeo/geo";

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const fast = await withTimeout(Promise.resolve("ok"), 200, () => "timeout");
  assert.equal(fast.value, "ok");
  assert.equal(fast.timedOut, false);

  const slow = await withTimeout(sleep(400).then(() => "late"), 80, () => "timeout");
  assert.equal(slow.value, "timeout");
  assert.equal(slow.timedOut, true);
  assert.ok(slow.durationMs < 200, `timeout trop long: ${slow.durationMs}ms`);

  const skipped = unknownPickupResult("timeout", "Distance indisponible (délai).");
  assert.equal(skipped.distanceKm, null);
  assert.equal(skipped.skipReason, "timeout");

  assert.ok(ANALYZE_BUDGETS.pickupMs <= 800);
  assert.ok(ANALYZE_BUDGETS.calibrationMs <= 400);
  assert.ok(ANALYZE_BUDGETS.visionProviderMs <= 8_000);

  console.log("✓ pipeline timeouts: withTimeout + pickup skip");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
