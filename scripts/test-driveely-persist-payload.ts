/**
 * Payload persist analyse — CHECK prod + fallback schéma ancien.
 * Usage: npx tsx scripts/test-driveely-persist-payload.ts
 */

import assert from "node:assert/strict";
import {
  buildRideInsertFallback,
  buildRideInsertPayload,
  dbExtractionQuality,
  dbVisionSource,
  finiteMoney,
  finiteScore,
} from "../lib/margeo/services/persist-analysis";
import type { RideOffer, UserProfile } from "../lib/margeo/types";

const profile: UserProfile = {
  name: "Test",
  firstName: "Test",
  lastName: "User",
  city: "Lyon",
  vehicle: "scooter_thermique",
  costPerKm: 0.18,
  targetHourly: 18,
  dailyTarget: 120,
  platforms: ["Uber Eats"],
  premium: true,
  minBenefit: 6,
  maxDistanceKm: 8,
  emptyReturns: "short_only",
};

const offer: RideOffer = {
  id: "offer-1",
  platform: "Uber Eats",
  pickup: "McDo Part-Dieu",
  dropoff: undefined as unknown as string,
  payout: 9.4,
  emptyReturnKm: Number.NaN,
};

assert.equal(dbExtractionQuality("unsafe"), "partial");
assert.equal(dbExtractionQuality("partial"), "partial");
assert.equal(dbExtractionQuality("complete"), "complete");
assert.equal(dbExtractionQuality("failed"), "failed");
assert.equal(dbExtractionQuality(undefined), "partial");

assert.equal(dbVisionSource("on_device_ocr"), "vision");
assert.equal(dbVisionSource("vision"), "vision");
assert.equal(dbVisionSource("mock"), "mock");
assert.equal(dbVisionSource(undefined), null);

const payload = buildRideInsertPayload("ride-1", "user-1", offer, profile, {
  visionSource: "on_device_ocr",
  visionConfidence: 1.4,
  missingFields: ["distanceKm", "durationMin"],
  extractionQuality: "unsafe",
});

assert.equal(payload.vision_source, "vision");
assert.equal(payload.extraction_quality, "partial");
assert.equal(payload.distance_km, null);
assert.equal(payload.duration_min, null);
assert.equal(payload.payout, 9.4);
assert.equal(payload.empty_return_km, 0);
assert.equal(payload.dropoff, "");
assert.equal(payload.pickup, "McDo Part-Dieu");
assert.equal(payload.vision_confidence, 1);
assert.deepEqual(payload.missing_fields, ["distanceKm", "durationMin"]);

const fallback = buildRideInsertFallback(payload);
assert.equal(fallback.distance_km, 0);
assert.equal(fallback.duration_min, 0);
assert.equal(fallback.vision_source, undefined);
assert.equal(fallback.extraction_quality, undefined);
assert.equal(fallback.payout, 9.4);

assert.equal(finiteMoney(Number.POSITIVE_INFINITY), 0);
assert.equal(finiteMoney(12.345), 12.35);
assert.equal(finiteScore(140), 100);
assert.equal(finiteScore(Number.NaN), 0);

console.log("persist-payload: 22 assertions OK");
