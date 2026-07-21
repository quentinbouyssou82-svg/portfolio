/**
 * Benchmark pipeline analyse Uberly (timings étape par étape).
 * Usage : set -a && source .env.local && set +a && npx tsx scripts/bench-uberly-analyze.ts
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");

for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq <= 0) continue;
  const key = trimmed.slice(0, eq).trim();
  const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
  if (!process.env[key]) process.env[key] = value;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const PUB = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const SECRET = process.env.SUPABASE_SECRET_KEY!;
const BASE = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const IMAGE = path.join(
  __dirname,
  "fixtures/captures/Capture_d_e_cran_2026-07-14_a__12.33.45-b5e27584-d1ba-43a4-9d3f-7beac887d803.png",
);

function adminHeaders() {
  return { apikey: SECRET, Authorization: `Bearer ${SECRET}` };
}

function cookieHeader(access: string, refresh: string) {
  const ref = new URL(SUPABASE_URL).hostname.split(".")[0];
  const key = `sb-${ref}-auth-token`;
  const payload = JSON.stringify({
    access_token: access,
    refresh_token: refresh,
    token_type: "bearer",
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
  });
  return `${key}=${encodeURIComponent(payload)}`;
}

async function setupUser() {
  const email = `uberly.bench.${Date.now()}@gmail.com`;
  const password = "TestUberly123!";
  const create = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: { ...adminHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: "Bench" },
    }),
  });
  const created = await create.json();
  if (!create.ok) throw new Error(JSON.stringify(created));
  const userId = created.id as string;

  await fetch(`${SUPABASE_URL}/rest/v1/margeo_profiles?id=eq.${userId}`, {
    method: "PATCH",
    headers: { ...adminHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({
      vehicle: "scooter",
      target_hourly: 22,
      min_benefit: 6,
      max_distance_km: 8,
      empty_returns: "short_only",
      weekly_hours: "20_30",
      cost_per_km: 0.24,
      onboarding_completed: true,
      premium: true,
      premium_until: new Date(Date.now() + 86_400_000).toISOString(),
      premium_source: "beta",
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
    userId,
    access: session.access_token as string,
    refresh: session.refresh_token as string,
  };
}

(async () => {
  console.log("Base:", BASE);
  const { userId, access, refresh } = await setupUser();
  const buf = fs.readFileSync(IMAGE);
  const runs: Array<{
    total: number;
    upload: number;
    ia: number;
    parsing: number;
    save: number;
    verdict: string;
    payout: number;
  }> = [];

  for (let i = 0; i < 3; i++) {
    const form = new FormData();
    form.append("image", new Blob([buf], { type: "image/png" }), "uber.png");
    const t0 = Date.now();
    const res = await fetch(`${BASE}/api/uberly/analyze`, {
      method: "POST",
      headers: { Cookie: cookieHeader(access, refresh) },
      body: form,
    });
    const wall = Date.now() - t0;
    const data = await res.json();
    if (res.status !== 200) {
      console.error("FAIL", res.status, data);
      process.exitCode = 1;
      break;
    }
    const timings = data.timings ?? {};
    runs.push({
      total: timings.total ?? wall,
      upload: timings.upload ?? 0,
      ia: timings.ia ?? 0,
      parsing: timings.parsing ?? 0,
      save: timings.save ?? 0,
      verdict: data.analysis?.verdict,
      payout: data.analysis?.offer?.payout,
    });
    console.log(
      `Run ${i + 1}: wall=${wall}ms apiTotal=${timings.total}ms upload=${timings.upload}ms ia=${timings.ia}ms save=${timings.save}ms verdict=${data.analysis?.verdict} payout=${data.analysis?.offer?.payout}`,
    );
  }

  if (runs.length) {
    const avg = (k: keyof (typeof runs)[0]) =>
      Math.round(runs.reduce((s, r) => s + Number(r[k]), 0) / runs.length);
    console.log("\n=== MOYENNE (3 runs) ===");
    console.log(`Upload (prépare image): ${avg("upload")} ms`);
    console.log(`IA (Mistral):           ${avg("ia")} ms`);
    console.log(`Parsing:                ${avg("parsing")} ms`);
    console.log(`Sauvegarde:             ${avg("save")} ms`);
    console.log(`Total API:              ${avg("total")} ms`);
  }

  await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
    method: "DELETE",
    headers: adminHeaders(),
  });
})();
