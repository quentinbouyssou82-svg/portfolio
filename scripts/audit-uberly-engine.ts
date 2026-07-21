/**
 * Audit moteur Uberly — captures Vision + robustesse profils + cohérence score.
 *
 * Usage :
 *   set -a && source .env.local && set +a
 *   npx tsx scripts/audit-uberly-engine.ts
 *   NEXT_PUBLIC_APP_URL=http://localhost:3000 npx tsx scripts/audit-uberly-engine.ts
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { analyzeOffer } from "../lib/margeo/engine";
import type { RideOffer, UserProfile, Verdict } from "../lib/margeo/types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");
for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const eq = t.indexOf("=");
  if (eq <= 0) continue;
  const k = t.slice(0, eq).trim();
  const v = t.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
  if (!process.env[k]) process.env[k] = v;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const PUB = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const SECRET = process.env.SUPABASE_SECRET_KEY!;
const BASE = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const CAPTURES = path.join(__dirname, "fixtures/captures");

type Finding = {
  severity: "error" | "warn" | "info";
  area: string;
  message: string;
  detail?: string;
};

const findings: Finding[] = [];
const passes: string[] = [];

function pass(id: string, detail?: string) {
  passes.push(id);
  console.log(`✅ ${id}${detail ? ` — ${detail}` : ""}`);
}

function finding(severity: Finding["severity"], area: string, message: string, detail?: string) {
  findings.push({ severity, area, message, detail });
  const icon = severity === "error" ? "❌" : severity === "warn" ? "⚠️" : "ℹ️";
  console.log(`${icon} [${area}] ${message}${detail ? ` — ${detail}` : ""}`);
}

function adminHeaders() {
  return { apikey: SECRET, Authorization: `Bearer ${SECRET}` };
}

function cookieHeader(access: string, refresh: string) {
  const ref = new URL(SUPABASE_URL).hostname.split(".")[0];
  const key = `sb-${ref}-auth-token`;
  return `${key}=${encodeURIComponent(
    JSON.stringify({
      access_token: access,
      refresh_token: refresh,
      token_type: "bearer",
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    }),
  )}`;
}

function baseProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    name: "Audit",
    firstName: "Audit",
    lastName: "Test",
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
    ...overrides,
  };
}

const REFERENCE_OFFER: RideOffer = {
  id: "ref-offer",
  platform: "Uber Eats",
  pickup: "McDonald's Part-Dieu",
  dropoff: "Villeurbanne",
  payout: 8.5,
  distanceKm: 4.2,
  durationMin: 22,
  emptyReturnKm: 1.8,
  pickupDistanceKm: 1.2,
};

function expectedVerdict(score: number): Verdict {
  if (score >= 68) return "accept";
  if (score >= 42) return "check";
  return "refuse";
}

function auditAnalysisConsistency(
  label: string,
  analysis: {
    score: number;
    verdict: Verdict;
    netGain: number;
    grossGain: number;
    explanation: string;
    offer: { distanceKm?: number; durationMin?: number };
  },
) {
  const v = expectedVerdict(analysis.score);
  let verdictOk = analysis.verdict === v;
  if (
    analysis.verdict === "check" &&
    v === "accept" &&
    (!analysis.offer.distanceKm || !analysis.offer.durationMin)
  ) {
    verdictOk = true;
  }
  if (!verdictOk) {
    finding(
      "error",
      "cohérence",
      `${label}: verdict incohérent`,
      `score=${analysis.score} verdict=${analysis.verdict} attendu≈${v}`,
    );
  } else {
    pass(`cohérence-verdict:${label}`, `${analysis.score}→${analysis.verdict}`);
  }

  if (analysis.netGain > analysis.grossGain + 0.01) {
    finding("error", "cohérence", `${label}: net > brut`, String(analysis.netGain));
  }
  if (analysis.score < 0 || analysis.score > 100) {
    finding("error", "cohérence", `${label}: score hors bornes`, String(analysis.score));
  }
  if (!analysis.explanation || analysis.explanation.length < 10) {
    finding("warn", "explication", `${label}: explication courte ou absente`);
  }
}

function runRobustnessMatrix() {
  console.log("\n── Robustesse multi-profils ──\n");
  const base = analyzeOffer(REFERENCE_OFFER, baseProfile()).score;

  const costLow = analyzeOffer(
    REFERENCE_OFFER,
    baseProfile({ costPerKm: 0.08 }),
  ).score;
  const costHigh = analyzeOffer(
    REFERENCE_OFFER,
    baseProfile({ costPerKm: 0.45 }),
  ).score;
  if (costLow > costHigh) {
    pass("robustesse:costPerKm", `${costLow} > ${costHigh}`);
  } else {
    finding(
      "error",
      "robustesse",
      "costPerKm élevé devrait baisser le score",
      `low=${costLow} high=${costHigh}`,
    );
  }

  const targetLow = analyzeOffer(
    REFERENCE_OFFER,
    baseProfile({ targetHourly: 12 }),
  ).score;
  const targetHigh = analyzeOffer(
    REFERENCE_OFFER,
    baseProfile({ targetHourly: 28 }),
  ).score;
  if (targetLow > targetHigh) {
    pass("robustesse:targetHourly", `${targetLow} > ${targetHigh}`);
  } else {
    finding(
      "error",
      "robustesse",
      "objectif €/h élevé devrait baisser le score",
      `low=${targetLow} high=${targetHigh}`,
    );
  }

  const minLow = analyzeOffer(
    REFERENCE_OFFER,
    baseProfile({ minBenefit: 3 }),
  ).score;
  const minHigh = analyzeOffer(
    REFERENCE_OFFER,
    baseProfile({ minBenefit: 12 }),
  ).score;
  if (minLow >= minHigh) {
    pass("robustesse:minBenefit", `${minLow} ≥ ${minHigh}`);
  } else {
    finding(
      "error",
      "robustesse",
      "bénéfice min élevé devrait baisser le score",
      `min3=${minLow} min12=${minHigh}`,
    );
  }

  const distWide = analyzeOffer(
    REFERENCE_OFFER,
    baseProfile({ maxDistanceKm: 15 }),
  ).score;
  const distTight = analyzeOffer(
    REFERENCE_OFFER,
    baseProfile({ maxDistanceKm: 3 }),
  ).score;
  if (distWide > distTight) {
    pass("robustesse:maxDistanceKm", `${distWide} > ${distTight}`);
  } else {
    finding(
      "error",
      "robustesse",
      "distance max basse devrait baisser le score",
      `wide=${distWide} tight=${distTight}`,
    );
  }

  const emptyYes = analyzeOffer(
    { ...REFERENCE_OFFER, emptyReturnKm: 4.5 },
    baseProfile({ emptyReturns: "yes" }),
  ).score;
  const emptyNo = analyzeOffer(
    { ...REFERENCE_OFFER, emptyReturnKm: 4.5 },
    baseProfile({ emptyReturns: "no" }),
  ).score;
  if (emptyYes > emptyNo) {
    pass("robustesse:emptyReturns", `yes=${emptyYes} > no=${emptyNo}`);
  } else {
    finding(
      "error",
      "robustesse",
      "refus retour à vide devrait baisser le score sur long empty",
      `yes=${emptyYes} no=${emptyNo}`,
    );
  }

  const waitShort = analyzeOffer(
    { ...REFERENCE_OFFER, durationMin: 18 },
    baseProfile(),
  ).score;
  const waitLong = analyzeOffer(
    { ...REFERENCE_OFFER, durationMin: 45 },
    baseProfile(),
  ).score;
  if (waitShort > waitLong) {
    pass("robustesse:waitTime", `${waitShort} > ${waitLong}`);
  } else {
    finding(
      "warn",
      "robustesse",
      "longue durée devrait tendre à baisser le score",
      `short=${waitShort} long=${waitLong}`,
    );
  }

  const carShort = analyzeOffer(
    { ...REFERENCE_OFFER, distanceKm: 1.2 },
    baseProfile({ vehicle: "voiture_essence" }),
  ).score;
  const carShortLegacy = analyzeOffer(
    { ...REFERENCE_OFFER, distanceKm: 1.2 },
    baseProfile({ vehicle: "voiture" }),
  ).score;
  if (carShort === carShortLegacy) {
    pass("robustesse:voiture_essence=voiture", String(carShort));
  } else {
    finding(
      "warn",
      "véhicule",
      "voiture legacy vs voiture_essence incohérent",
      `${carShort} vs ${carShortLegacy}`,
    );
  }

  pass("robustesse:base-score", String(base));
}

async function setupUser() {
  const email = `uberly.audit.${Date.now()}@gmail.com`;
  const password = "TestUberly123!";
  const create = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: { ...adminHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: "Audit Engine" },
    }),
  });
  const user = await create.json();
  if (!create.ok) throw new Error(JSON.stringify(user));

  await fetch(`${SUPABASE_URL}/rest/v1/margeo_profiles`, {
    method: "POST",
    headers: {
      ...adminHeaders(),
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify({
      id: user.id,
      onboarding_completed: true,
      name: "Audit",
      vehicle: "scooter",
      city: "Lyon",
      cost_per_km: 0.18,
      target_hourly: 18,
      min_benefit: 6,
      max_distance_km: 8,
      empty_returns: "short_only",
      premium: true,
      premium_until: new Date(Date.now() + 86_400_000).toISOString(),
    }),
  });

  const signIn = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: PUB, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const session = await signIn.json();
  if (!signIn.ok) throw new Error(JSON.stringify(session));

  return {
    userId: user.id as string,
    email,
    access: session.access_token as string,
    refresh: session.refresh_token as string,
  };
}

async function testGeolocation(access: string, refresh: string, userId: string) {
  console.log("\n── Géolocalisation ──\n");
  const cookie = cookieHeader(access, refresh);

  const getEmpty = await fetch(`${BASE}/api/uberly/location`, {
    headers: { Cookie: cookie },
  });
  if (getEmpty.ok) {
    const body = await getEmpty.json();
    pass("geo:GET", JSON.stringify(body).slice(0, 80));
  } else {
    finding("error", "geo", "GET /location échoue", String(getEmpty.status));
  }

  const postGrant = await fetch(`${BASE}/api/uberly/location`, {
    method: "POST",
    headers: { Cookie: cookie, "Content-Type": "application/json" },
    body: JSON.stringify({
      lat: 45.764,
      lng: 4.8357,
      accuracy: 25,
      permission: "granted",
    }),
  });
  if (!postGrant.ok) {
    finding("error", "geo", "POST granted échoue", await postGrant.text());
    return;
  }
  pass("geo:POST-granted");

  const getAfter = await fetch(`${BASE}/api/uberly/location`, {
    headers: { Cookie: cookie },
  });
  const stored = await getAfter.json();
  if (
    Math.abs(Number(stored.lat) - 45.764) < 0.001 &&
    stored.permission === "granted"
  ) {
    pass("geo:persist", `${stored.lat}, ${stored.lng}`);
  } else {
    finding(
      "error",
      "geo",
      "position non persistée en profil",
      JSON.stringify(stored),
    );
  }

  const prof = await fetch(
    `${SUPABASE_URL}/rest/v1/margeo_profiles?id=eq.${userId}&select=last_lat,last_lng,location_permission`,
    { headers: adminHeaders() },
  );
  const rows = await prof.json();
  if (rows[0]?.location_permission === "denied") {
    pass("geo:denied-persist");
  }

  const postDeny = await fetch(`${BASE}/api/uberly/location`, {
    method: "POST",
    headers: { Cookie: cookie, "Content-Type": "application/json" },
    body: JSON.stringify({ permission: "denied" }),
  });
  if (postDeny.ok) pass("geo:POST-denied");
  else finding("error", "geo", "POST denied échoue", await postDeny.text());
}

const CAPTURE_FIXTURES = [
  {
    name: "Lyon 12,45€",
    file: "Capture_d_e_cran_2026-07-12_a__10.52.55-fed1f0f5-27e7-4d6a-a080-0711085da50a.png",
    expectPayout: 12.45,
  },
  {
    name: "Marseille 8,30€",
    file: "Capture_d_e_cran_2026-07-12_a__10.53.11-8f26efc6-d0e9-469b-9f2a-8b2dd7a587f6.png",
    expectPayout: 8.3,
  },
  {
    name: "Paris 6,20€",
    file: "Capture_d_e_cran_2026-07-12_a__10.53.56-3bb7c5d5-f3a5-4320-9342-f74296c5d042.png",
    expectPayout: 6.2,
  },
  {
    name: "Toulouse 4,15€",
    file: "Capture_d_e_cran_2026-07-12_a__10.54.13-10b8afcd-6626-4cb0-b08c-b5af25d9bfaa.png",
    expectPayout: 4.15,
  },
  {
    name: "Nice 3,30€",
    file: "Capture_d_e_cran_2026-07-12_a__10.54.25-b68f6b46-9c8f-4bfb-bcdf-842f624595c9.png",
    expectPayout: 3.3,
  },
  {
    name: "Uber Eats 7,80€",
    file: "Capture_d_e_cran_2026-07-14_a__12.33.45-b5e27584-d1ba-43a4-9d3f-7beac887d803.png",
    expectPayout: 7.8,
  },
];

async function testVisionCaptures(access: string, refresh: string) {
  console.log("\n── Analyses Vision (captures) ──\n");
  const cookie = cookieHeader(access, refresh);
  const results: Record<string, unknown>[] = [];

  for (const cap of CAPTURE_FIXTURES) {
    const filePath = path.join(CAPTURES, cap.file);
    if (!fs.existsSync(filePath)) {
      finding("warn", "vision", `fixture absente: ${cap.name}`);
      continue;
    }

    const buf = fs.readFileSync(filePath);
    const blob = new Blob([buf], { type: "image/png" });
    const form = new FormData();
    form.append("image", blob, cap.file);
    form.append("courierLat", "45.764");
    form.append("courierLng", "4.8357");

    const started = Date.now();
    const res = await fetch(`${BASE}/api/uberly/analyze`, {
      method: "POST",
      headers: { Cookie: cookie },
      body: form,
    });
    const ms = Date.now() - started;
    const data = (await res.json()) as Record<string, unknown>;

    if (!res.ok) {
      finding(
        "error",
        "vision",
        `${cap.name}: analyse échouée`,
        `${data.error ?? res.status} (${ms}ms)`,
      );
      continue;
    }

    const analysis = data.analysis as Record<string, unknown>;
    const offer = analysis.offer as Record<string, unknown>;
    const payout = Number(offer.payout);
    const score = Number(analysis.score);
    const verdict = String(analysis.verdict);

    const payoutOk = Math.abs(payout - cap.expectPayout) < 0.15;
    if (payoutOk) pass(`vision:${cap.name}:payout`, `${payout}€`);
    else
      finding(
        "warn",
        "vision",
        `${cap.name}: payout attendu ${cap.expectPayout}`,
        `lu=${payout}`,
      );

    auditAnalysisConsistency(cap.name, {
      score,
      verdict: verdict as Verdict,
      netGain: Number(analysis.netGain),
      grossGain: Number(analysis.grossGain),
      explanation: String(analysis.explanation),
      offer: {
        distanceKm: offer.distanceKm as number | undefined,
        durationMin: offer.durationMin as number | undefined,
      },
    });

    pass(
      `vision:${cap.name}`,
      `${verdict} ${score}/100 · ${ms}ms · net=${analysis.netGain}€`,
    );

    results.push({
      capture: cap.name,
      ms,
      platform: offer.platform,
      payout,
      distanceKm: offer.distanceKm,
      durationMin: offer.durationMin,
      emptyReturnKm: offer.emptyReturnKm,
      grossGain: analysis.grossGain,
      estimatedCost: analysis.estimatedCost,
      netGain: analysis.netGain,
      hourlyRate: analysis.hourlyRate,
      score,
      verdict,
      explanation: String(analysis.explanation).slice(0, 120),
      missingFields: data.missingFields,
      confidence: data.confidence,
      breakdown: analysis.scoreBreakdown,
    });
  }

  const reportPath = path.join(__dirname, "audit-uberly-engine-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  pass("rapport-json", reportPath);
}

async function main() {
  console.log(`\n=== Audit moteur Uberly — ${BASE} ===\n`);

  runRobustnessMatrix();

  let session: Awaited<ReturnType<typeof setupUser>> | null = null;
  try {
    session = await setupUser();
    await testGeolocation(session.access, session.refresh, session.userId);
    await testVisionCaptures(session.access, session.refresh);
  } catch (e) {
    finding("error", "setup", "échec setup utilisateur", String(e));
  } finally {
    if (session) {
      await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${session.userId}`, {
        method: "DELETE",
        headers: adminHeaders(),
      });
    }
  }

  const errors = findings.filter((f) => f.severity === "error");
  console.log(`\n── Synthèse ──`);
  console.log(`${passes.length} checks OK · ${findings.length} findings`);
  console.log(`  errors: ${errors.length} · warns: ${findings.filter((f) => f.severity === "warn").length}`);

  if (errors.length) {
    console.log("\nErreurs critiques:");
    for (const e of errors) console.log(`  • [${e.area}] ${e.message}`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
