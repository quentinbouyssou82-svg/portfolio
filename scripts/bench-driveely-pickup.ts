/**
 * Benchmark pickup P01–P07 + régression R01–R09.
 * Usage: npx tsx scripts/bench-driveely-pickup.ts
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { analyzeOffer } from "../lib/margeo/engine";
import type { RideOffer, UserProfile, Verdict } from "../lib/margeo/types";
import type { StructuredVisionFields } from "../lib/margeo/vision/extraction-types";
import type { ExtractionField } from "../lib/margeo/vision/extraction-types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const profile: UserProfile = {
  name: "Bench",
  firstName: "Bench",
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

function num(
  value: number | null,
  opts: Partial<ExtractionField<number>> = {},
): ExtractionField<number> {
  return {
    value,
    confidence: value != null ? (opts.confidence ?? 0.95) : 0,
    source: value != null ? (opts.source ?? "vision") : "unknown",
    isVisible: value != null && opts.source !== "derived",
    isEstimated: opts.isEstimated ?? false,
  };
}

function str(value: string | null, confidence = 0.95): ExtractionField<string> {
  return {
    value,
    confidence: value ? confidence : 0,
    source: value ? "vision" : "unknown",
    isVisible: Boolean(value),
    isEstimated: false,
  };
}

function buildFields(
  partial: Partial<StructuredVisionFields> = {},
): StructuredVisionFields {
  return {
    platform: partial.platform ?? str("Uber Eats"),
    pickup: partial.pickup ?? str("McDonald's Part-Dieu"),
    dropoff: partial.dropoff ?? str("Villeurbanne"),
    payout: partial.payout ?? num(10),
    distanceKm: partial.distanceKm ?? num(8),
    durationMin: partial.durationMin ?? num(20),
    emptyReturnKm: partial.emptyReturnKm ?? num(1.5),
    pickupDistanceKm: partial.pickupDistanceKm ?? num(null),
    multipleOffersDetected: partial.multipleOffersDetected ?? false,
    bonusIncluded: partial.bonusIncluded ?? null,
  };
}

interface PickupScenario {
  id: string;
  label: string;
  offer: RideOffer;
  fields: StructuredVisionFields;
  expect: {
    pickupKm: number | null;
    minScore?: number;
    maxScore?: number;
    verdict?: Verdict;
    totalKm?: number | null;
    pickupMustBeNull?: boolean;
    reliabilityMax?: number;
    reliabilityMin?: number;
  };
}

const baseOffer = {
  id: "p-base",
  platform: "Uber Eats" as const,
  pickup: "McDonald's Part-Dieu",
  dropoff: "Villeurbanne",
  payout: 10,
  distanceKm: 8,
  durationMin: 20,
  emptyReturnKm: 1.5,
};

const scenarios: PickupScenario[] = [
  {
    id: "P01",
    label: "Pickup 0,5 km — impact faible",
    offer: { ...baseOffer, id: "p01", pickupDistanceKm: 0.5 },
    fields: buildFields({ pickupDistanceKm: num(0.5, { source: "derived" }) }),
    expect: { pickupKm: 0.5, minScore: 55 },
  },
  {
    id: "P02",
    label: "Pickup 4 km — impact important",
    offer: { ...baseOffer, id: "p02", pickupDistanceKm: 4 },
    fields: buildFields({ pickupDistanceKm: num(4, { source: "derived" }) }),
    expect: { pickupKm: 4, maxScore: 70, totalKm: 13.5 },
  },
  {
    id: "P03",
    label: "Pickup 8 km — potentiellement non rentable",
    offer: { ...baseOffer, id: "p03", pickupDistanceKm: 8 },
    fields: buildFields({ pickupDistanceKm: num(8, { source: "derived" }) }),
    expect: { pickupKm: 8, maxScore: 55, verdict: "refuse" },
  },
  {
    id: "P04",
    label: "GPS absent — pickup inconnu, analyse continue",
    offer: { ...baseOffer, id: "p04", pickupDistanceKm: undefined },
    fields: buildFields({ pickupDistanceKm: num(null) }),
    expect: { pickupKm: null, pickupMustBeNull: true },
  },
  {
    id: "P05",
    label: "Adresse ambiguë — pickup inconnu",
    offer: {
      ...baseOffer,
      id: "p05",
      pickup: "McDonald's",
      pickupDistanceKm: undefined,
    },
    fields: buildFields({
      pickup: str("McDonald's", 0.55),
      pickupDistanceKm: num(null),
    }),
    expect: { pickupKm: null, pickupMustBeNull: true },
  },
  {
    id: "P06",
    label: "Pickup connu + bonne course",
    offer: {
      id: "p06",
      platform: "Uber Eats",
      pickup: "McDonald's Part-Dieu",
      dropoff: "Villeurbanne",
      payout: 14,
      distanceKm: 4.2,
      durationMin: 18,
      emptyReturnKm: 1,
      pickupDistanceKm: 0.8,
    },
    fields: buildFields({
      payout: num(14),
      distanceKm: num(4.2),
      durationMin: num(18),
      emptyReturnKm: num(1),
      pickupDistanceKm: num(0.8, { source: "derived" }),
    }),
    expect: { pickupKm: 0.8, verdict: "accept", reliabilityMin: 85 },
  },
  {
    id: "P07",
    label: "Pickup inconnu + course limite",
    offer: {
      id: "p07",
      platform: "Uber Eats",
      pickup: "McDonald's Part-Dieu",
      dropoff: "Villeurbanne",
      payout: 8.2,
      distanceKm: 6.5,
      durationMin: 26,
      emptyReturnKm: undefined,
      pickupDistanceKm: undefined,
    },
    fields: buildFields({
      payout: num(8.2),
      distanceKm: num(6.5),
      durationMin: num(26),
      emptyReturnKm: num(null),
      pickupDistanceKm: num(null),
    }),
    expect: { pickupKm: null, pickupMustBeNull: true, verdict: "check" },
  },
];

type Row = {
  id: string;
  label: string;
  score: number;
  verdict: Verdict;
  pickupKm: number | null;
  totalKm: number | null;
  knownKm: number | null;
  confidence: number;
  ok: boolean;
  notes: string[];
};

const results: Row[] = [];
let failures = 0;

for (const scenario of scenarios) {
  const analysis = analyzeOffer(scenario.offer, profile, undefined, {
    fields: scenario.fields,
  });
  const pickupKm = analysis.economics?.pickupDistanceKm ?? null;
  const notes: string[] = [];
  let ok = true;

  if (pickupKm !== scenario.expect.pickupKm) {
    ok = false;
    notes.push(`pickupKm ${pickupKm} != ${scenario.expect.pickupKm}`);
  }
  if (scenario.expect.pickupMustBeNull) {
    if (pickupKm != null) {
      ok = false;
      notes.push("pickup inventé");
    }
    if (pickupKm === 0) {
      ok = false;
      notes.push("null→0");
    }
  }
  if (scenario.expect.minScore != null && analysis.score < scenario.expect.minScore) {
    ok = false;
    notes.push(`score ${analysis.score} < ${scenario.expect.minScore}`);
  }
  if (scenario.expect.maxScore != null && analysis.score > scenario.expect.maxScore) {
    ok = false;
    notes.push(`score ${analysis.score} > ${scenario.expect.maxScore}`);
  }
  if (scenario.expect.verdict && analysis.verdict !== scenario.expect.verdict) {
    ok = false;
    notes.push(`verdict ${analysis.verdict} != ${scenario.expect.verdict}`);
  }
  if (
    scenario.expect.totalKm != null &&
    analysis.economics?.totalKm !== scenario.expect.totalKm
  ) {
    ok = false;
    notes.push(`totalKm ${analysis.economics?.totalKm} != ${scenario.expect.totalKm}`);
  }
  if (
    scenario.expect.reliabilityMin != null &&
    (analysis.reliability?.decisionConfidence ?? 0) < scenario.expect.reliabilityMin
  ) {
    ok = false;
    notes.push(`conf ${analysis.reliability?.decisionConfidence} < ${scenario.expect.reliabilityMin}`);
  }
  if (
    scenario.expect.reliabilityMax != null &&
    (analysis.reliability?.decisionConfidence ?? 100) > scenario.expect.reliabilityMax
  ) {
    ok = false;
    notes.push(`conf ${analysis.reliability?.decisionConfidence} > ${scenario.expect.reliabilityMax}`);
  }

  if (!ok) failures += 1;
  results.push({
    id: scenario.id,
    label: scenario.label,
    score: analysis.score,
    verdict: analysis.verdict,
    pickupKm,
    totalKm: analysis.economics?.totalKm ?? null,
    knownKm: analysis.economics?.knownKm ?? null,
    confidence: analysis.reliability?.decisionConfidence ?? 0,
    ok,
    notes,
  });

  const icon = ok ? "✅" : "❌";
  console.log(
    `${icon} ${scenario.id} ${scenario.label} · rent=${analysis.score} · ${analysis.verdict} · pickup=${pickupKm ?? "null"} · conf=${analysis.reliability?.decisionConfidence}${notes.length ? ` · ${notes.join("; ")}` : ""}`,
  );
}

const p01 = results.find((r) => r.id === "P01")!;
const p02 = results.find((r) => r.id === "P02")!;
const p03 = results.find((r) => r.id === "P03")!;
if (!(p01.score > p02.score && p02.score > p03.score)) {
  failures += 1;
  console.log(
    `❌ monotonicité pickup scores: P01=${p01.score} P02=${p02.score} P03=${p03.score}`,
  );
} else {
  console.log(`✅ monotonicité scores P01 > P02 > P03 (${p01.score} > ${p02.score} > ${p03.score})`);
}

const outDir = path.join(__dirname, "baselines");
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, "bench-pickup-report.json");
fs.writeFileSync(
  outPath,
  JSON.stringify(
    { generatedAt: new Date().toISOString(), failures, results },
    null,
    2,
  ),
);

console.log("\n=== SYNTHÈSE PICKUP ===");
console.log(`Scénarios OK: ${results.length - failures}/${results.length}`);
console.log(`Rapport: ${outPath}`);

process.exitCode = failures > 0 ? 1 : 0;
