import assert from "node:assert/strict";
import { analyzeOffer } from "../lib/margeo/engine";
import { computeReliabilityScores } from "../lib/margeo/reliability/compute";
import type { RideOffer, UserProfile } from "../lib/margeo/types";
import { validateExtractedOffer } from "../lib/margeo/vision/validate-offer";

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

const baseOffer: RideOffer = {
  id: "offer-1",
  platform: "Uber Eats",
  pickup: "Pickup",
  dropoff: "Dropoff",
  payout: 8.5,
  distanceKm: 4.2,
  durationMin: 22,
  emptyReturnKm: 1.8,
};

{
  const validated = validateExtractedOffer({
    raw: {
      platform: "Uber Eats",
      pickup: "Pickup",
      dropoff: "Dropoff",
      payout: 8.5,
      distanceKm: 4.2,
      durationMin: 22,
      emptyReturnKm: null,
      pickupDistanceKm: null,
      multipleOffersDetected: null,
      bonusIncluded: null,
    },
    fields: {
      platform: {
        value: "Uber Eats",
        confidence: 0.84,
        source: "vision",
        isVisible: true,
        isEstimated: false,
      },
      pickup: {
        value: "Pickup",
        confidence: 0.86,
        source: "vision",
        isVisible: true,
        isEstimated: false,
      },
      dropoff: {
        value: "Dropoff",
        confidence: 0.86,
        source: "vision",
        isVisible: true,
        isEstimated: false,
      },
      payout: {
        value: 8.5,
        confidence: 0.98,
        source: "vision",
        isVisible: true,
        isEstimated: false,
      },
      distanceKm: {
        value: 4.2,
        confidence: 0.92,
        source: "vision",
        isVisible: true,
        isEstimated: false,
      },
      durationMin: {
        value: 22,
        confidence: 0.9,
        source: "vision",
        isVisible: true,
        isEstimated: false,
      },
      emptyReturnKm: {
        value: null,
        confidence: 0,
        source: "unknown",
        isVisible: false,
        isEstimated: false,
      },
      pickupDistanceKm: {
        value: null,
        confidence: 0,
        source: "unknown",
        isVisible: false,
        isEstimated: false,
      },
      multipleOffersDetected: false,
      bonusIncluded: null,
    },
    missingFields: [],
    quality: "complete",
  }, profile);

  assert.equal(validated.offer.emptyReturnKm, undefined);
  assert.ok(validated.reliability.decisionConfidence > 0);
  assert.ok(validated.reliability.extractionScore > 0);
}

{
  const analysis = analyzeOffer(baseOffer, profile);
  assert.equal(analysis.decisionState, "profitable");
  assert.ok(analysis.reliability);
  assert.ok(analysis.score > 0);
  assert.notEqual(analysis.score, analysis.reliability.decisionConfidence);
}

{
  const missingDistance = analyzeOffer(
    { ...baseOffer, distanceKm: undefined },
    profile,
  );
  assert.ok(missingDistance.reliability!.decisionConfidence < 90);
  assert.equal(missingDistance.verdict, "check");
  assert.ok(missingDistance.score > 0);
}

{
  const highPayoutMissingDuration = analyzeOffer(
    {
      ...baseOffer,
      payout: 35,
      durationMin: undefined,
    },
    profile,
  );
  const rel = computeReliabilityScores({
    fields: {
      platform: { value: "Uber Eats", confidence: 0.95, source: "vision", isVisible: true, isEstimated: false },
      pickup: { value: "Pickup", confidence: 0.95, source: "vision", isVisible: true, isEstimated: false },
      dropoff: { value: "Dropoff", confidence: 0.95, source: "vision", isVisible: true, isEstimated: false },
      payout: { value: 35, confidence: 0.98, source: "vision", isVisible: true, isEstimated: false },
      distanceKm: { value: 4.2, confidence: 0.95, source: "vision", isVisible: true, isEstimated: false },
      durationMin: { value: null, confidence: 0, source: "unknown", isVisible: false, isEstimated: false },
      emptyReturnKm: { value: 1.8, confidence: 0.9, source: "vision", isVisible: true, isEstimated: false },
      pickupDistanceKm: { value: 1, confidence: 0.9, source: "vision", isVisible: true, isEstimated: false },
      multipleOffersDetected: false,
      bonusIncluded: null,
    },
    offer: { ...baseOffer, payout: 35, durationMin: undefined },
    profile,
    economics: null,
  });
  assert.ok(rel.calculationScore > 50, "durée manquante moins pénalisante si payout élevé");
}

{
  const noSilentZero = analyzeOffer(
    { ...baseOffer, emptyReturnKm: undefined },
    profile,
  );
  assert.equal(noSilentZero.economics?.emptyReturnKm, null);
}

console.log("✅ driveely engine reliability OK");
