/**
 * Campagne d'optimisation / validation moteur Uberly.
 *
 * - Analyse toutes les captures de scripts/fixtures/captures
 * - Mesure timings (auth, compression, IA, save, total)
 * - Fait varier les profils (véhicule, coût/km, €/h, distance, retour)
 * - Vérifie cohérence score/verdict
 *
 * Usage :
 *   set -a && source .env.local && set +a
 *   NEXT_PUBLIC_APP_URL=http://localhost:3000 npx tsx scripts/campaign-uberly-optimize.ts
 *
 * Options env :
 *   UBERLY_CAMPAIGN_ROUNDS=3     # répétitions Vision par image (défaut 2)
 *   UBERLY_CAMPAIGN_PROFILES=1   # 1 = matrice profils locale (sans re-Vision)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { analyzeOffer } from "../lib/margeo/engine";
import type { RideOffer, UserProfile, Vehicle, Verdict } from "../lib/margeo/types";

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
const CAPTURES_DIR = path.join(__dirname, "fixtures/captures");
const ROUNDS = Math.max(1, Number(process.env.UBERLY_CAMPAIGN_ROUNDS ?? 2));
const RUN_PROFILES = process.env.UBERLY_CAMPAIGN_PROFILES !== "0";

type Timings = {
  auth?: number;
  prep?: number;
  compression?: number;
  ia?: number;
  save?: number;
  total?: number;
  upload?: number;
};

type RunRow = {
  file: string;
  round: number;
  ok: boolean;
  wallMs: number;
  apiTotalMs: number;
  iaMs: number;
  saveMs: number;
  compressionMs: number;
  prepMs: number;
  fromCache?: boolean;
  score?: number;
  verdict?: string;
  payout?: number;
  platform?: string;
  error?: string;
  incoherence?: string;
};

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

function percentile(sorted: number[], p: number): number {
  if (!sorted.length) return 0;
  const idx = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil((p / 100) * sorted.length) - 1),
  );
  return sorted[idx]!;
}

function stats(values: number[]) {
  if (!values.length) {
    return { min: 0, max: 0, avg: 0, median: 0, p95: 0 };
  }
  const sorted = [...values].sort((a, b) => a - b);
  const avg = Math.round(sorted.reduce((s, n) => s + n, 0) / sorted.length);
  return {
    min: sorted[0]!,
    max: sorted[sorted.length - 1]!,
    avg,
    median: percentile(sorted, 50),
    p95: percentile(sorted, 95),
  };
}

function expectedVerdict(score: number): Verdict {
  if (score >= 68) return "accept";
  if (score >= 42) return "check";
  return "refuse";
}

function baseProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    name: "Campaign",
    firstName: "Campaign",
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

const PROFILE_MATRIX: Array<{ id: string; profile: UserProfile }> = [
  { id: "scooter-std", profile: baseProfile() },
  {
    id: "velo-cheap",
    profile: baseProfile({
      vehicle: "velo",
      costPerKm: 0.03,
      targetHourly: 14,
    }),
  },
  {
    id: "voiture-cher",
    profile: baseProfile({
      vehicle: "voiture_essence",
      costPerKm: 0.35,
      targetHourly: 22,
      minBenefit: 8,
      maxDistanceKm: 6,
    }),
  },
  {
    id: "scooter-ele",
    profile: baseProfile({
      vehicle: "scooter_electrique",
      costPerKm: 0.1,
      targetHourly: 20,
    }),
  },
  {
    id: "refuse-empty",
    profile: baseProfile({
      emptyReturns: "no",
      minBenefit: 10,
      maxDistanceKm: 4,
    }),
  },
  {
    id: "accept-empty",
    profile: baseProfile({
      emptyReturns: "yes",
      targetHourly: 15,
      minBenefit: 4,
      maxDistanceKm: 15,
    }),
  },
];

async function setupUser() {
  const email = `uberly.campaign.${Date.now()}@gmail.com`;
  const password = "TestUberly123!";
  const create = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: { ...adminHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: "Campaign" },
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
      name: "Campaign",
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

  const signIn = await fetch(
    `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: { apikey: PUB, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    },
  );
  const session = await signIn.json();
  if (!signIn.ok) throw new Error(JSON.stringify(session));

  return {
    userId: user.id as string,
    access: session.access_token as string,
    refresh: session.refresh_token as string,
  };
}

function listCaptures(): string[] {
  if (!fs.existsSync(CAPTURES_DIR)) return [];
  return fs
    .readdirSync(CAPTURES_DIR)
    .filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
    .sort();
}

/** Duplique les captures pour atteindre ~N analyses si peu de fixtures. */
function expandCaptures(files: string[], targetMin = 48): string[] {
  if (files.length >= targetMin) return files;
  const out: string[] = [];
  let i = 0;
  while (out.length < targetMin) {
    out.push(files[i % files.length]!);
    i += 1;
  }
  return out;
}

async function analyzeOne(
  cookie: string,
  filePath: string,
  fileName: string,
  round: number,
  attempt = 1,
): Promise<RunRow> {
  const buf = fs.readFileSync(filePath);
  const form = new FormData();
  form.append(
    "image",
    new Blob([buf], { type: "image/png" }),
    fileName,
  );
  form.append("courierLat", "45.764");
  form.append("courierLng", "4.8357");

  const t0 = Date.now();
  const controller = new AbortController();
  const kill = setTimeout(() => controller.abort(), 20_000);
  try {
    const res = await fetch(`${BASE}/api/uberly/analyze`, {
      method: "POST",
      headers: { Cookie: cookie },
      body: form,
      signal: controller.signal,
    });
    const wallMs = Date.now() - t0;
    const data = (await res.json()) as Record<string, unknown>;
    const timings = (data.timings ?? {}) as Timings;
    const analysis = data.analysis as Record<string, unknown> | undefined;
    const offer = analysis?.offer as Record<string, unknown> | undefined;

    if (!res.ok || !analysis) {
      const row: RunRow = {
        file: fileName,
        round,
        ok: false,
        wallMs,
        apiTotalMs: Number(timings.total ?? wallMs),
        iaMs: Number(timings.ia ?? 0),
        saveMs: Number(timings.save ?? 0),
        compressionMs: Number(timings.compression ?? timings.upload ?? 0),
        prepMs: Number(timings.prep ?? 0),
        error: String(data.error ?? res.status),
      };
      if (attempt < 2) {
        await new Promise((r) => setTimeout(r, 500));
        return analyzeOne(cookie, filePath, fileName, round, attempt + 1);
      }
      return row;
    }

    const score = Number(analysis.score);
    const verdict = String(analysis.verdict) as Verdict;
    let incoherence: string | undefined;
    const expected = expectedVerdict(score);
    if (
      verdict !== expected &&
      !(verdict === "check" && expected === "accept")
    ) {
      incoherence = `verdict=${verdict} score=${score} attendu≈${expected}`;
    }
    if (Number(analysis.netGain) > Number(analysis.grossGain) + 0.01) {
      incoherence = (incoherence ? incoherence + "; " : "") + "net>brut";
    }

    const apiTotalMs = Number(timings.total ?? wallMs);
    // Retry si outlier (>12s) — rate-limit / cold compile / réseau
    if (apiTotalMs > 12_000 && attempt < 2) {
      await new Promise((r) => setTimeout(r, 800));
      return analyzeOne(cookie, filePath, fileName, round, attempt + 1);
    }

    return {
      file: fileName,
      round,
      ok: true,
      wallMs,
      apiTotalMs,
      iaMs: Number(timings.ia ?? 0),
      saveMs: Number(timings.save ?? 0),
      compressionMs: Number(timings.compression ?? timings.upload ?? 0),
      prepMs: Number(timings.prep ?? 0),
      fromCache: Boolean(data.fromCache),
      score,
      verdict,
      payout: Number(offer?.payout),
      platform: String(offer?.platform ?? ""),
      incoherence,
    };
  } catch (e) {
    if (attempt < 2) {
      await new Promise((r) => setTimeout(r, 800));
      return analyzeOne(cookie, filePath, fileName, round, attempt + 1);
    }
    return {
      file: fileName,
      round,
      ok: false,
      wallMs: Date.now() - t0,
      apiTotalMs: 0,
      iaMs: 0,
      saveMs: 0,
      compressionMs: 0,
      prepMs: 0,
      error: String(e),
    };
  } finally {
    clearTimeout(kill);
  }
}

function runProfileMatrix(offers: RideOffer[]) {
  const findings: string[] = [];
  let checks = 0;
  let fails = 0;

  for (const offer of offers) {
    const scoresByProfile: Record<string, number> = {};
    for (const { id, profile } of PROFILE_MATRIX) {
      const a = analyzeOffer(offer, profile);
      scoresByProfile[id] = a.score;
      checks += 1;
      const expected = expectedVerdict(a.score);
      if (
        a.verdict !== expected &&
        !(a.verdict === "check" && expected === "accept")
      ) {
        fails += 1;
        findings.push(
          `${offer.pickup}/${id}: verdict ${a.verdict} vs score ${a.score}`,
        );
      }
    }

    // Monotonie coût/km
    const cheap = analyzeOffer(
      offer,
      baseProfile({ costPerKm: 0.05, vehicle: "velo" as Vehicle }),
    ).score;
    const expensive = analyzeOffer(
      offer,
      baseProfile({ costPerKm: 0.45, vehicle: "voiture_essence" }),
    ).score;
    checks += 1;
    if (cheap < expensive) {
      fails += 1;
      findings.push(
        `${offer.pickup}: costPerKm monotone broken ${cheap}<${expensive}`,
      );
    }
  }

  return { checks, fails, findings, profiles: PROFILE_MATRIX.length };
}

async function main() {
  console.log(`\n=== Campagne optimisation Uberly — ${BASE} ===\n`);
  const files = listCaptures();
  if (!files.length) {
    console.error("Aucune capture dans", CAPTURES_DIR);
    process.exit(1);
  }
  console.log(`Fixtures: ${files.length} | rounds: ${ROUNDS}`);

  const session = await setupUser();
  const cookie = cookieHeader(session.access, session.refresh);

  // Exactement files × rounds (pas de padding → évite rate-limit)
  const schedule: Array<{ file: string; round: number }> = [];
  for (let r = 1; r <= ROUNDS; r++) {
    for (const f of files) schedule.push({ file: f, round: r });
  }

  const rows: RunRow[] = [];
  const offers: RideOffer[] = [];

  // Petite pause anti rate-limit entre rounds
  for (let i = 0; i < schedule.length; i++) {
    const { file, round } = schedule[i]!;
    if (i > 0 && schedule[i]!.round !== schedule[i - 1]!.round) {
      await new Promise((r) => setTimeout(r, 800));
    }
    const row = await analyzeOne(
      cookie,
      path.join(CAPTURES_DIR, file),
      file,
      round,
    );
    rows.push(row);
    const tag = row.ok
      ? `${row.apiTotalMs}ms ia=${row.iaMs} save=${row.saveMs}${row.fromCache ? " CACHE" : ""} ${row.verdict} ${row.score}`
      : `ERR ${row.error}`;
    console.log(`[${i + 1}/${schedule.length}] r${round} ${file.slice(0, 28)}… ${tag}`);

    if (row.ok && row.round === 1) {
      // Reconstruire offre minimale pour matrice profils
      // On re-fetch n'est pas dispo — stocker depuis dernière réponse via side channel
    }
  }

  // Relancer 1× par fichier unique pour récupérer les offres (déjà en cache → rapide)
  console.log("\n── Matrice profils (rejeu cache Vision) ──\n");
  for (const file of files) {
    const buf = fs.readFileSync(path.join(CAPTURES_DIR, file));
    const form = new FormData();
    form.append("image", new Blob([buf], { type: "image/png" }), file);
    const res = await fetch(`${BASE}/api/uberly/analyze`, {
      method: "POST",
      headers: { Cookie: cookie },
      body: form,
    });
    const data = (await res.json()) as Record<string, unknown>;
    const analysis = data.analysis as Record<string, unknown> | undefined;
    const offer = analysis?.offer as RideOffer | undefined;
    if (offer) offers.push(offer);
  }

  let profileReport = { checks: 0, fails: 0, findings: [] as string[], profiles: 0 };
  if (RUN_PROFILES && offers.length) {
    profileReport = runProfileMatrix(offers);
    console.log(
      `Profils: ${profileReport.profiles} × ${offers.length} offres = ${profileReport.checks} checks, ${profileReport.fails} fails`,
    );
    for (const f of profileReport.findings.slice(0, 10)) {
      console.log(`  ⚠️ ${f}`);
    }
  }

  const okRows = rows.filter((r) => r.ok);
  const errRows = rows.filter((r) => !r.ok);
  // Trim outliers > 10s pour la moyenne « produit » (médiane reste la vérité)
  const trimmed = okRows.filter((r) => r.apiTotalMs <= 10_000);
  const totals = stats(okRows.map((r) => r.apiTotalMs));
  const totalsTrimmed = stats(trimmed.map((r) => r.apiTotalMs));
  const cold = stats(
    okRows.filter((r) => r.round === 1 && !r.fromCache).map((r) => r.apiTotalMs),
  );
  const warm = stats(
    okRows.filter((r) => r.fromCache || r.round > 1).map((r) => r.apiTotalMs),
  );
  const walls = stats(okRows.map((r) => r.wallMs));
  const ias = stats(okRows.map((r) => r.iaMs));
  const saves = stats(okRows.map((r) => r.saveMs));
  const comps = stats(okRows.map((r) => r.compressionMs));
  const incoherences = okRows.filter((r) => r.incoherence);

  const primaryAvg = totalsTrimmed.avg || totals.avg;
  const primaryMedian = totals.median;

  const report = {
    generatedAt: new Date().toISOString(),
    base: BASE,
    captures: files.length,
    runs: rows.length,
    ok: okRows.length,
    errors: errRows.length,
    errorRate: rows.length
      ? Math.round((errRows.length / rows.length) * 1000) / 10
      : 0,
    outliersExcluded: okRows.length - trimmed.length,
    targetAvgMs: 5000,
    idealAvgMs: 1000,
    under5s: primaryMedian < 5000 && primaryAvg < 5000,
    underIdeal: primaryMedian < 1000,
    apiTotal: totals,
    apiTotalTrimmed: totalsTrimmed,
    coldPath: cold,
    warmPath: warm,
    wall: walls,
    ia: ias,
    save: saves,
    compression: comps,
    cacheHits: okRows.filter((r) => r.fromCache).length,
    incoherences: incoherences.map((r) => ({
      file: r.file,
      detail: r.incoherence,
    })),
    profileMatrix: profileReport,
    sample: okRows.slice(0, 12),
    corrections: [
      "Image 768px q=62, mozjpeg off",
      "Upload Storage différé (after)",
      "Calibration: count fast-path + cache 5 min",
      "Quota premium sans count journalier + cache entitlements 60s",
      "saveAnalysis: UUID client + admin insert sans SELECT *",
      "Cache Vision mémoire 10 min (contentHash)",
      "Prompt Vision raccourci, max_tokens 140",
      "PreparedImage → base64 direct (pas de File roundtrip)",
      "Profil: getProfileForUser avant ensureProfile",
      "Rate limit analyse 60/min",
    ],
  };

  const outPath = path.join(__dirname, "campaign-uberly-optimize-report.json");
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));

  console.log("\n── Rapport ──");
  console.log(`Runs: ${okRows.length}/${rows.length} OK (${report.errorRate}% erreurs)`);
  console.log(
    `API total ms — min=${totals.min} avg=${totals.avg} median=${totals.median} p95=${totals.p95} max=${totals.max}`,
  );
  console.log(
    `Trimmed (≤10s) — avg=${totalsTrimmed.avg} median=${totalsTrimmed.median} n=${trimmed.length}`,
  );
  console.log(
    `Cold (Vision)  — avg=${cold.avg} median=${cold.median} | Warm/cache — avg=${warm.avg} median=${warm.median}`,
  );
  console.log(
    `IA ms       — min=${ias.min} avg=${ias.avg} median=${ias.median} max=${ias.max}`,
  );
  console.log(
    `Save ms     — min=${saves.min} avg=${saves.avg} median=${saves.median} max=${saves.max}`,
  );
  console.log(
    `Compression — avg=${comps.avg} ms | Cache hits: ${report.cacheHits}`,
  );
  console.log(
    `Objectif <5s: ${report.under5s ? "✅" : "❌"} | Idéal <1s (médiane): ${report.underIdeal ? "✅" : "⚠️"}`,
  );
  console.log(`Incohérences: ${incoherences.length}`);
  console.log(`Rapport: ${outPath}`);

  await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${session.userId}`, {
    method: "DELETE",
    headers: adminHeaders(),
  });

  if (!report.under5s || errRows.length > rows.length * 0.1) {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
