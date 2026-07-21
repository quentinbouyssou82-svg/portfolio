/**
 * Test analyse Vision end-to-end sur les 6 captures Uberly.
 * Usage : set -a && source .env.local && set +a && npx tsx scripts/test-uberly-vision-all.ts
 * Prod  : NEXT_PUBLIC_APP_URL=https://margeo.vercel.app npx tsx scripts/test-uberly-vision-all.ts
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

const CAPTURES_DIR = path.join(__dirname, "fixtures/captures");

const IMAGES = [
  { name: "Lyon 12,45€", file: "Capture_d_e_cran_2026-07-12_a__10.52.55-fed1f0f5-27e7-4d6a-a080-0711085da50a.png", expectPayout: 12.45 },
  { name: "Marseille 8,30€", file: "Capture_d_e_cran_2026-07-12_a__10.53.11-8f26efc6-d0e9-469b-9f2a-8b2dd7a587f6.png", expectPayout: 8.3 },
  { name: "Paris 6,20€", file: "Capture_d_e_cran_2026-07-12_a__10.53.56-3bb7c5d5-f3a5-4320-9342-f74296c5d042.png", expectPayout: 6.2 },
  { name: "Toulouse 4,15€", file: "Capture_d_e_cran_2026-07-12_a__10.54.13-10b8afcd-6626-4cb0-b08c-b5af25d9bfaa.png", expectPayout: 4.15 },
  { name: "Nice 3,30€", file: "Capture_d_e_cran_2026-07-12_a__10.54.25-b68f6b46-9c8f-4bfb-bcdf-842f624595c9.png", expectPayout: 3.3 },
  { name: "Uber Eats 7,80€", file: "Capture_d_e_cran_2026-07-14_a__12.33.45-b5e27584-d1ba-43a4-9d3f-7beac887d803.png", expectPayout: 7.8 },
];

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
  const email = `uberly.vision.${Date.now()}@gmail.com`;
  const password = "TestUberly123!";
  const create = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: { ...adminHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: "Vision Test" },
    }),
  });
  const created = await create.json();
  if (!create.ok) throw new Error(`create: ${JSON.stringify(created)}`);
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
      // Premium temporaire pour tester >5 images sans quota free
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
  if (!signIn.ok) throw new Error(`signIn: ${JSON.stringify(session)}`);

  return { userId, access: session.access_token as string, refresh: session.refresh_token as string };
}

type StepResult = { ok: boolean; detail?: string };

function checkSteps(data: Record<string, unknown>, resOk: boolean): StepResult[] {
  const analysis = data.analysis as Record<string, unknown> | undefined;
  const offer = analysis?.offer as Record<string, unknown> | undefined;
  return [
    { ok: resOk, detail: resOk ? undefined : String(data.error ?? data.code) },
    { ok: resOk && data.source === "vision", detail: String(data.source ?? "none") },
    { ok: resOk && Boolean(analysis?.verdict), detail: String(analysis?.verdict ?? "") },
    { ok: resOk && (offer?.payout as number) > 0, detail: `payout=${offer?.payout}` },
    { ok: resOk && typeof analysis?.score === "number", detail: `score=${analysis?.score}` },
    { ok: resOk && Boolean(analysis?.id), detail: String(analysis?.id ?? "") },
  ];
}

(async () => {
  console.log("Base:", BASE);
  console.log("MISTRAL local:", process.env.MISTRAL_API_KEY ? "set" : "MISSING");

  const health = await fetch(`${BASE}/api/uberly/health`).then((r) => r.json());
  console.log("Health:", JSON.stringify(health.checks));
  console.log("readyForBeta:", health.readyForBeta, "missing:", health.missing);

  const { userId, access, refresh } = await setupUser();
  const results: string[] = [];
  let allOk = true;

  for (const img of IMAGES) {
    const filePath = path.join(CAPTURES_DIR, img.file);
    if (!fs.existsSync(filePath)) {
      results.push(`❌ ${img.name} — fichier absent`);
      allOk = false;
      continue;
    }

    const buf = fs.readFileSync(filePath);
    const form = new FormData();
    form.append("image", new Blob([buf], { type: "image/png" }), img.file);

    const started = Date.now();
    const res = await fetch(`${BASE}/api/uberly/analyze`, {
      method: "POST",
      headers: { Cookie: cookieHeader(access, refresh) },
      body: form,
    });
    const ms = Date.now() - started;
    const data = await res.json();
    const steps = checkSteps(data, res.status === 200);
    const stepOk = steps.every((s) => s.ok);

    if (stepOk) {
      const a = data.analysis;
      const payout = a.offer?.payout;
      results.push(
        `✅ ${img.name} — ${ms}ms — verdict=${a.verdict} score=${a.score} payout=${payout}€ net=${a.netGain}€ source=${data.source}`,
      );
    } else {
      allOk = false;
      results.push(
        `❌ ${img.name} — ${ms}ms — HTTP ${res.status} — ${JSON.stringify(data).slice(0, 200)}`,
      );
    }
  }

  console.log("\n" + results.join("\n"));
  console.log(allOk ? "\n✓ Toutes les captures OK" : "\n✗ Échecs détectés");

  await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
    method: "DELETE",
    headers: adminHeaders(),
  });

  process.exitCode = allOk ? 0 : 1;
})();
