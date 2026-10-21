/**
 * Benchmark fiabilité graduelle Driveely — scénarios R01–R09.
 * Usage: npx tsx scripts/bench-driveely-reliability.ts
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { analyzeOffer } from "../lib/margeo/engine";
import type { RideOffer, UserProfile, Verdict } from "../lib/margeo/types";
import type {
  ExtractionField,
  StructuredVisionFields,
} from "../lib/margeo/vision/extraction-types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const profile: UserProfile = {
  name: "Bench",
  firstName: "Bench",
  lastName: "Reliability",
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
    isVisible: value != null,
    isEstimated: opts.isEstimated ?? false,
  };
}

function str(
  value: string | null,
  confidence = 0.95,
): ExtractionField<string> {
  return {
    value,
    confidence: value ? confidence : 0,
    source: value ? "vision" : "unknown",
    isVisible: Boolean(value),
    isEstimated: false,
  };
}

function buildFields(partial: Partial<StructuredVisionFields>): StructuredVisionFields {
  return {
    platform: partial.platform ?? str("Uber Eats"),
    pickup: partial.pickup ?? str("McDonald's"),
    dropoff: partial.dropoff ?? str("Villeurbanne"),
    payout: partial.payout ?? num(8.5),
    distanceKm: partial.distanceKm ?? num(4.2),
    durationMin: partial.durationMin ?? num(22),
    emptyReturnKm: partial.emptyReturnKm ?? num(1.2),
    pickupDistanceKm: partial.pickupDistanceKm ?? num(1.0),
    multipleOffersDetected: partial.multipleOffersDetected ?? false,
    bonusIncluded: partial.bonusIncluded ?? null,
  };
}

type Range = { min: number; max: number };

interface ReliabilityScenario {
  id: string;
  label: string;
  offer: RideOffer;
  fields: StructuredVisionFields;
  captureDegraded?: boolean;
  expected: {
    extraction: Range;
    calculation: Range;
    decision: Range;
    rawVerdict?: Verdict;
    finalVerdict?: Verdict;
    monotonicRank: number;
  };
}

const scenarios: ReliabilityScenario[] = [
  {
    id: "R01",
    label: "Capture parfaite",
    offer: {
      id: "r01",
      platform: "Uber Eats",
      pickup: "McDonald's",
      dropoff: "Villeurbanne",
      payout: 12.45,
      distanceKm: 4.2,
      durationMin: 22,
      emptyReturnKm: 1.2,
      pickupDistanceKm: 1,
    },
    fields: buildFields({}),
    expected: {
      extraction: { min: 90, max: 100 },
      calculation: { min: 88, max: 100 },
      decision: { min: 88, max: 100 },
      rawVerdict: "accept",
      finalVerdict: "accept",
      monotonicRank: 10,
    },
  },
  {
    id: "R02",
    label: "Distance légèrement ambiguë",
    offer: {
      id: "r02",
      platform: "Uber Eats",
      pickup: "McDonald's",
      dropoff: "Villeurbanne",
      payout: 12.45,
      distanceKm: 4.2,
      durationMin: 22,
      emptyReturnKm: 1.2,
      pickupDistanceKm: 1,
    },
    fields: buildFields({
      distanceKm: num(4.2, { confidence: 0.78 }),
    }),
    expected: {
      extraction: { min: 82, max: 95 },
      calculation: { min: 82, max: 98 },
      decision: { min: 80, max: 95 },
      monotonicRank: 9,
    },
  },
  {
    id: "R03",
    label: "Durée absente — payout élevé",
    offer: {
      id: "r03",
      platform: "Uber Eats",
      pickup: "McDonald's",
      dropoff: "Villeurbanne",
      payout: 35,
      distanceKm: 6,
      durationMin: undefined,
      emptyReturnKm: 1.5,
      pickupDistanceKm: 1.2,
    },
    fields: buildFields({
      payout: num(35),
      distanceKm: num(6),
      durationMin: num(null),
      emptyReturnKm: num(1.5),
    }),
    expected: {
      extraction: { min: 85, max: 92 },
      calculation: { min: 85, max: 95 },
      decision: { min: 82, max: 90 },
      rawVerdict: "accept",
      finalVerdict: "accept",
      monotonicRank: 7,
    },
  },
  {
    id: "R04",
    label: "Distance estimée + retour à vide inconnu",
    offer: {
      id: "r04",
      platform: "Uber Eats",
      pickup: "McDonald's",
      dropoff: "Villeurbanne",
      payout: 8.5,
      distanceKm: 4.2,
      durationMin: 22,
      emptyReturnKm: undefined,
      pickupDistanceKm: 1,
    },
    fields: buildFields({
      distanceKm: num(4.2, { source: "derived", isEstimated: true, confidence: 0.65 }),
      emptyReturnKm: num(null),
    }),
    expected: {
      extraction: { min: 60, max: 82 },
      calculation: { min: 55, max: 78 },
      decision: { min: 55, max: 78 },
      monotonicRank: 6,
    },
  },
  {
    id: "R05",
    label: "Plusieurs offres détectées",
    offer: {
      id: "r05",
      platform: "Uber Eats",
      pickup: "McDonald's",
      dropoff: "Villeurbanne",
      payout: 8.5,
      distanceKm: 4.2,
      durationMin: 22,
      emptyReturnKm: 1.2,
      pickupDistanceKm: 1,
    },
    fields: buildFields({ multipleOffersDetected: true }),
    expected: {
      extraction: { min: 70, max: 78 },
      calculation: { min: 78, max: 85 },
      decision: { min: 65, max: 72 },
      finalVerdict: "check",
      monotonicRank: 4,
    },
  },
  {
    id: "R06",
    label: "Montant ambigu",
    offer: {
      id: "r06",
      platform: "Uber Eats",
      pickup: "McDonald's",
      dropoff: "Villeurbanne",
      payout: 8.5,
      distanceKm: 4.2,
      durationMin: 22,
      emptyReturnKm: 1.2,
      pickupDistanceKm: 1,
    },
    fields: buildFields({
      payout: num(8.5, { confidence: 0.62 }),
    }),
    expected: {
      extraction: { min: 78, max: 82 },
      calculation: { min: 88, max: 92 },
      decision: { min: 74, max: 78 },
      finalVerdict: "check",
      monotonicRank: 5,
    },
  },
  {
    id: "R07",
    label: "Capture très dégradée",
    offer: {
      id: "r07",
      platform: "Uber Eats",
      pickup: "McDonald's",
      dropoff: "Villeurbanne",
      payout: 8.5,
      distanceKm: 4.2,
      durationMin: 22,
      emptyReturnKm: 1.2,
      pickupDistanceKm: 1,
    },
    fields: buildFields({}),
    captureDegraded: true,
    expected: {
      extraction: { min: 68, max: 72 },
      calculation: { min: 75, max: 80 },
      decision: { min: 64, max: 68 },
      finalVerdict: "check",
      monotonicRank: 2,
    },
  },
  {
    id: "R08",
    label: "Bonne rentabilité + faible fiabilité",
    offer: {
      id: "r08",
      platform: "Uber Eats",
      pickup: "McDonald's",
      dropoff: "Villeurbanne",
      payout: 14,
      distanceKm: 3.5,
      durationMin: undefined,
      emptyReturnKm: undefined,
      pickupDistanceKm: undefined,
    },
    fields: buildFields({
      payout: num(14),
      distanceKm: num(3.5),
      durationMin: num(null),
      emptyReturnKm: num(null),
      pickupDistanceKm: num(null),
    }),
    expected: {
      extraction: { min: 68, max: 75 },
      calculation: { min: 65, max: 72 },
      decision: { min: 68, max: 74 },
      rawVerdict: "accept",
      finalVerdict: "check",
      monotonicRank: 3,
    },
  },
  {
    id: "R09",
    label: "Mauvaise rentabilité + haute fiabilité",
    offer: {
      id: "r09",
      platform: "Uber Eats",
      pickup: "McDonald's",
      dropoff: "Loin",
      payout: 3.3,
      distanceKm: 8.5,
      durationMin: 28,
      emptyReturnKm: 2.5,
      pickupDistanceKm: 2,
    },
    fields: buildFields({
      payout: num(3.3),
      distanceKm: num(8.5),
      durationMin: num(28),
      emptyReturnKm: num(2.5),
      pickupDistanceKm: num(2),
    }),
    expected: {
      extraction: { min: 88, max: 100 },
      calculation: { min: 85, max: 100 },
      decision: { min: 85, max: 100 },
      rawVerdict: "refuse",
      finalVerdict: "refuse",
      monotonicRank: 8,
    },
  },
];

function inRange(value: number, range: Range): boolean {
  return value >= range.min && value <= range.max;
}

type ResultRow = {
  id: string;
  label: string;
  extractionScore: number;
  calculationScore: number;
  decisionConfidence: number;
  profitabilityScore: number;
  rawVerdict: Verdict;
  finalVerdict: Verdict;
  ok: boolean;
  notes: string[];
};

const results: ResultRow[] = [];
let failures = 0;

for (const scenario of scenarios) {
  const analysis = analyzeOffer(scenario.offer, profile, undefined, {
    fields: scenario.fields,
    captureDegraded: scenario.captureDegraded,
  });
  const rel = analysis.reliability!;
  const notes: string[] = [];
  let ok = true;

  if (!inRange(rel.extractionScore, scenario.expected.extraction)) {
    ok = false;
    notes.push(
      `extraction ${rel.extractionScore} ∉ [${scenario.expected.extraction.min}, ${scenario.expected.extraction.max}]`,
    );
  }
  if (!inRange(rel.calculationScore, scenario.expected.calculation)) {
    ok = false;
    notes.push(
      `calculation ${rel.calculationScore} ∉ [${scenario.expected.calculation.min}, ${scenario.expected.calculation.max}]`,
    );
  }
  if (!inRange(rel.decisionConfidence, scenario.expected.decision)) {
    ok = false;
    notes.push(
      `decision ${rel.decisionConfidence} ∉ [${scenario.expected.decision.min}, ${scenario.expected.decision.max}]`,
    );
  }

  const profitabilityVerdict: Verdict =
    analysis.decisionState === "profitable"
      ? "accept"
      : analysis.decisionState === "unprofitable"
        ? "refuse"
        : "check";

  if (scenario.expected.rawVerdict && profitabilityVerdict !== scenario.expected.rawVerdict) {
    ok = false;
    notes.push(`rawVerdict ${profitabilityVerdict} != ${scenario.expected.rawVerdict}`);
  }

  if (scenario.expected.finalVerdict && analysis.verdict !== scenario.expected.finalVerdict) {
    ok = false;
    notes.push(`finalVerdict ${analysis.verdict} != ${scenario.expected.finalVerdict}`);
  }

  if (scenario.offer.payout > 0 && rel.extractionScore < rel.decisionConfidence + 5) {
    // sanity: extraction usually >= decision when many calc penalties - not strict
  }

  if (!ok) failures += 1;

  results.push({
    id: scenario.id,
    label: scenario.label,
    extractionScore: rel.extractionScore,
    calculationScore: rel.calculationScore,
    decisionConfidence: rel.decisionConfidence,
    profitabilityScore: analysis.score,
    rawVerdict: profitabilityVerdict,
    finalVerdict: analysis.verdict,
    ok,
    notes,
  });

  const icon = ok ? "✅" : "❌";
  console.log(
    `${icon} ${scenario.id} ${scenario.label} · ext=${rel.extractionScore} calc=${rel.calculationScore} conf=${rel.decisionConfidence} · rent=${analysis.score} · ${analysis.verdict}${notes.length ? ` · ${notes.join("; ")}` : ""}`,
  );
}

// Monotonicity: lower rank => lower or equal decision confidence vs higher rank scenarios
const byRank = [...scenarios]
  .sort((a, b) => a.expected.monotonicRank - b.expected.monotonicRank)
  .map((s) => results.find((r) => r.id === s.id)!);

let monotonicOk = true;
for (let i = 1; i < byRank.length; i++) {
  if (byRank[i].decisionConfidence + 8 < byRank[i - 1].decisionConfidence) {
    monotonicOk = false;
    console.log(
      `⚠️ monotonicité: ${byRank[i].id} (${byRank[i].decisionConfidence}) << ${byRank[i - 1].id} (${byRank[i - 1].decisionConfidence})`,
    );
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  failures,
  monotonicOk,
  results,
};

const outDir = path.join(__dirname, "baselines");
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, "bench-reliability-report.json");
fs.writeFileSync(outPath, JSON.stringify(report, null, 2));

console.log("\n=== SYNTHÈSE ===");
console.log(`Scénarios OK: ${results.length - failures}/${results.length}`);
console.log(`Monotonicité: ${monotonicOk ? "OK" : "À ajuster"}`);
console.log(`Rapport: ${outPath}`);

process.exitCode = failures > 0 || !monotonicOk ? 1 : 0;
