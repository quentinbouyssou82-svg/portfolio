/**
 * Test fonctionnel API Uberly (signup admin → onboarding → analyse → feedback).
 * Usage : set -a && source .env.local && set +a && npx tsx scripts/test-uberly-full-flow.ts
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

const email = `uberly.flow.${Date.now()}@gmail.com`;
const password = "TestUberly123!";

function adminHeaders() {
  return { apikey: SECRET, Authorization: `Bearer ${SECRET}` };
}

async function adminCreateUser() {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: { ...adminHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: "Flow Test" },
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`adminCreateUser: ${JSON.stringify(data)}`);
  return data.id as string;
}

async function signIn() {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: PUB, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`signIn: ${JSON.stringify(data)}`);
  return data as { access_token: string; refresh_token: string };
}

function cookieHeader(access: string, refresh: string) {
  const ref = new URL(SUPABASE_URL).hostname.split(".")[0];
  const key = `sb-${ref}-auth-token`;
  const payload = JSON.stringify({
    access_token: access,
    refresh_token: refresh,
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: "bearer",
  });
  return `${key}=${encodeURIComponent(payload)}`;
}

async function patchOnboarding(userId: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/margeo_profiles?id=eq.${userId}`, {
    method: "PATCH",
    headers: {
      ...adminHeaders(),
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      name: "Flow Test",
      city: "Lyon",
      vehicle: "scooter",
      platforms: ["Uber Eats"],
      target_hourly: 16,
      daily_target: 90,
      cost_per_km: 0.24,
      onboarding_completed: true,
    }),
  });
  if (res.ok) return;
  const ins = await fetch(`${SUPABASE_URL}/rest/v1/margeo_profiles`, {
    method: "POST",
    headers: {
      ...adminHeaders(),
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      id: userId,
      name: "Flow Test",
      city: "Lyon",
      vehicle: "scooter",
      platforms: ["Uber Eats"],
      target_hourly: 16,
      daily_target: 90,
      cost_per_km: 0.24,
      onboarding_completed: true,
    }),
  });
  if (!ins.ok) throw new Error(`onboarding: ${await ins.text()}`);
}

async function analyze(access: string, refresh: string) {
  const fixture = path.join(__dirname, "fixtures/uberly-test-screenshot.png");
  const buf = fs.readFileSync(fixture);
  const form = new FormData();
  form.append("image", new Blob([buf], { type: "image/png" }), "screenshot.png");

  const res = await fetch(`${BASE}/api/uberly/analyze`, {
    method: "POST",
    headers: { Cookie: cookieHeader(access, refresh) },
    body: form,
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function feedback(access: string, refresh: string, analysisId: string) {
  const res = await fetch(`${BASE}/api/uberly/feedback`, {
    method: "POST",
    headers: {
      Cookie: cookieHeader(access, refresh),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      analysisId,
      accepted: true,
      actualGain: 9.5,
      actualDurationMin: 25,
    }),
  });
  const data = await res.json();
  return { status: res.status, data };
}

const steps: string[] = [];

(async () => {
  try {
    const userId = await adminCreateUser();
    steps.push("✓ Signup (admin)");

    const session = await signIn();
    steps.push("✓ Login");

    await patchOnboarding(userId);
    steps.push("✓ Onboarding profil");

    const { status, data } = await analyze(
      session.access_token,
      session.refresh_token,
    );
    if (status !== 200) {
      throw new Error(`analyse ${status}: ${JSON.stringify(data).slice(0, 400)}`);
    }
    steps.push(`✓ Analyse (verdict=${data.analysis?.verdict})`);

    const fb = await feedback(
      session.access_token,
      session.refresh_token,
      data.analysis.id,
    );
    if (fb.status !== 200) {
      throw new Error(`feedback ${fb.status}: ${JSON.stringify(fb.data).slice(0, 200)}`);
    }
    steps.push("✓ Feedback");

    const quota = await fetch(`${BASE}/api/uberly/quota`, {
      headers: { Cookie: cookieHeader(session.access_token, session.refresh_token) },
    });
    if (quota.ok) steps.push("✓ Dashboard/quota API");

    console.log(steps.join("\n"));
    console.log("\n✓ Parcours complet OK");
  } catch (e) {
    console.log(steps.join("\n"));
    console.error("\n✗", e instanceof Error ? e.message : e);
    process.exit(1);
  }
})();
