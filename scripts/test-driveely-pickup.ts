/**
 * Tests pickup réel : jamais de 0 inventé, impact économique.
 * Usage: npx tsx scripts/test-driveely-pickup.ts
 *
 * Note: resolvePickupDistance / resolveTripDistance / isPickupAddressUsable
 * ne sont pas dans le module geo de production (haversine + Nominatim uniquement).
 * Ce fichier ne teste que le moteur `analyzeOffer` pour éviter d’inventer un routeur.
 */
import assert from "node:assert/strict";
import { analyzeOffer } from "../lib/margeo/engine";
import type { RideOffer, UserProfile } from "../lib/margeo/types";
import type { StructuredVisionFields } from "../lib/margeo/vision/extraction-types";

const profile: UserProfile = {
  name: "Test",
  firstName: "Test",
  lastName: "Pickup",
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

function offer(partial: Partial<RideOffer> = {}): RideOffer {
  return {
    id: "p-offer",
    platform: "Uber Eats",
    pickup: "McDonald's Part-Dieu",
    dropoff: "Villeurbanne",
    payout: 10,
    distanceKm: 8,
    durationMin: 20,
    emptyReturnKm: 1.5,
    ...partial,
  };
}

function num(
  value: number | null,
  opts: { source?: "vision" | "derived" | "unknown"; isEstimated?: boolean; confidence?: number } = {},
) {
  return {
    value,
    confidence: value != null ? (opts.confidence ?? 0.95) : 0,
    source: value != null ? (opts.source ?? "vision") : "unknown",
    isVisible: value != null && opts.source !== "derived",
    isEstimated: opts.isEstimated ?? false,
  };
}

function str(value: string | null) {
  return {
    value,
    confidence: value ? 0.9 : 0,
    source: value ? "vision" : "unknown",
    isVisible: Boolean(value),
    isEstimated: false,
  } as const;
}

function fields(pickupKm: number | null, source: "vision" | "derived" | "unknown" = "derived"): StructuredVisionFields {
  return {
    platform: str("Uber Eats"),
    pickup: str("McDonald's Part-Dieu"),
    dropoff: str("Villeurbanne"),
    payout: num(10),
    distanceKm: num(8),
    durationMin: num(20),
    emptyReturnKm: num(1.5),
    pickupDistanceKm: num(pickupKm, { source: pickupKm == null ? "unknown" : source, isEstimated: false }),
    multipleOffersDetected: false,
    bonusIncluded: null,
  };
}

{
  const none = analyzeOffer(offer({ pickupDistanceKm: undefined }), profile, undefined, {
    fields: fields(null),
  });
  const short = analyzeOffer(offer({ pickupDistanceKm: 0.5 }), profile, undefined, {
    fields: fields(0.5),
  });
  const mid = analyzeOffer(offer({ pickupDistanceKm: 4 }), profile, undefined, {
    fields: fields(4),
  });
  const long = analyzeOffer(offer({ pickupDistanceKm: 8 }), profile, undefined, {
    fields: fields(8),
  });

  assert.equal(none.economics?.pickupDistanceKm, null);
  assert.notEqual(none.economics?.pickupDistanceKm, 0);
  assert.equal(none.economics?.knownKm, 9.5);
  assert.ok(short.score >= mid.score, `0.5km (${short.score}) devrait ≥ 4km (${mid.score})`);
  assert.ok(mid.score >= long.score, `4km (${mid.score}) devrait ≥ 8km (${long.score})`);
  assert.ok(
    none.score > mid.score,
    `sans pickup (${none.score}) ne doit pas être plus pessimiste que 4 km (${mid.score}) de façon artificielle, mais 4 km doit baisser le score vs omis: ${none.score} vs ${mid.score}`,
  );
  assert.ok(none.score - mid.score >= 8, `pickup 4 km trop faible: ${none.score} → ${mid.score}`);
  assert.equal(mid.economics?.travelKm, 12);
  assert.equal(mid.economics?.totalKm, 13.5);
  assert.ok((mid.economics?.payoutPerKm ?? 99) < (none.economics?.payoutPerKm ?? 0));
  assert.equal(long.verdict, "refuse");
  console.log(
    `✅ impact pickup none=${none.score} 0.5km=${short.score} 4km=${mid.score} 8km=${long.score} · 8km verdict=${long.verdict}`,
  );
}

{
  const unknown = analyzeOffer(
    offer({
      pickupDistanceKm: undefined,
      durationMin: 24,
      distanceKm: 6,
      payout: 7.2,
      emptyReturnKm: undefined,
    }),
    profile,
    undefined,
    {
      fields: {
        ...fields(null),
        payout: num(7.2),
        distanceKm: num(6),
        durationMin: num(24),
        emptyReturnKm: num(null),
        pickupDistanceKm: num(null),
      },
    },
  );
  assert.equal(unknown.economics?.pickupDistanceKm, null);
  assert.equal(unknown.economics?.emptyReturnKm, null);
  assert.equal(unknown.economics?.totalKm, null);
  assert.ok(!unknown.reliability?.estimatedFields.includes("pickupDistanceKm"));
  assert.ok(unknown.reliability?.cautionFields.includes("pickupDistanceKm"));
  console.log(
    `✅ pickup inconnu: score=${unknown.score} conf=${unknown.reliability?.decisionConfidence} verdict=${unknown.verdict} knownKm=${unknown.economics?.knownKm}`,
  );
}

{
  const derived = analyzeOffer(offer({ pickupDistanceKm: 3.2 }), profile, undefined, {
    fields: fields(3.2, "derived"),
    pickupTravelMin: 9,
  });
  assert.equal(derived.economics?.pickupDurationMin, 9);
  assert.ok((derived.hourlyRate ?? 0) < 30);
  assert.equal(derived.reliability?.estimatedFields.includes("pickupDistanceKm"), false);
  console.log(
    `✅ pickup dérivé 3.2 km · rent=${derived.score} conf=${derived.reliability?.decisionConfidence} €/h=${derived.hourlyRate}`,
  );
}

console.log("\nTous les tests pickup moteur sont OK.");
