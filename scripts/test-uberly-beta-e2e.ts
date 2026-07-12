/**
 * Test bêta Uberly complet : auth + analyse + historique.
 * Usage : set -a && source .env.local && set +a && npx tsx scripts/test-uberly-beta-e2e.ts
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

const email = `uberly.beta.${Date.now()}@gmail.com`;
const password = "TestUberly123!";

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

const steps: string[] = [];
let userId = "";
let access = "";
let refresh = "";
let analysisId = "";

async function fetchWithRetry(url: string, init?: RequestInit, retries = 3) {
  let lastErr: unknown;
  for (let i = 0; i < retries; i++) {
    try {
      return await fetch(url, init);
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
  throw lastErr;
}

async function adminCreateUser() {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: { ...adminHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: "Beta Test" },
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

(async () => {
  try {
    userId = await adminCreateUser();
    steps.push("✓ Signup");

    const session = await signIn();
    access = session.access_token;
    refresh = session.refresh_token;
    steps.push("✓ Login");

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
      }),
    });
    steps.push("✓ Onboarding");

    const fixture = path.join(__dirname, "fixtures/uberly-test-screenshot.png");
    const buf = fs.readFileSync(fixture);
    const form = new FormData();
    form.append("image", new Blob([buf], { type: "image/png" }), "screenshot.png");

    const analyzeRes = await fetch(`${BASE}/api/uberly/analyze`, {
      method: "POST",
      headers: { Cookie: cookieHeader(access, refresh) },
      body: form,
    });
    const analyzeData = await analyzeRes.json();
    if (analyzeRes.status !== 200) {
      throw new Error(`analyse ${analyzeRes.status}: ${JSON.stringify(analyzeData).slice(0, 300)}`);
    }
    analysisId = analyzeData.analysis?.id;
    steps.push(`✓ Analyse (${analyzeData.source}, verdict=${analyzeData.analysis?.verdict})`);

    const histRes = await fetch(`${BASE}/demos/uberly/historique`, {
      headers: { Cookie: cookieHeader(access, refresh) },
      redirect: "manual",
    });
    if (histRes.status >= 400) throw new Error(`historique ${histRes.status}`);
    steps.push("✓ Historique page");

    const listRes = await fetch(
      `${SUPABASE_URL}/rest/v1/margeo_analyses?user_id=eq.${userId}&select=id&order=analyzed_at.desc&limit=1`,
      { headers: adminHeaders() },
    );
    const list = await listRes.json();
    if (!listRes.ok || !list[0]?.id) throw new Error("historique DB vide");
    steps.push("✓ Historique DB");

    if (analysisId) {
      const detailRes = await fetch(`${BASE}/demos/uberly/historique/${analysisId}`, {
        headers: { Cookie: cookieHeader(access, refresh) },
        redirect: "manual",
      });
      if (detailRes.status >= 400) throw new Error(`historique detail ${detailRes.status}`);
      steps.push("✓ Historique détail");
    }

    await fetchWithRetry(`${SUPABASE_URL}/auth/v1/logout`, {
      method: "POST",
      headers: {
        apikey: PUB,
        Authorization: `Bearer ${access}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ scope: "global" }),
    });
    steps.push("✓ Logout");

    const relogin = await signIn();
    access = relogin.access_token;
    refresh = relogin.refresh_token;
    steps.push("✓ Re-login");

    const dash = await fetch(`${BASE}/demos/uberly/dashboard`, {
      headers: { Cookie: cookieHeader(access, refresh) },
      redirect: "manual",
    });
    const loc = dash.headers.get("location") ?? "";
    if (loc.includes("/login") || loc.includes("/onboarding")) {
      throw new Error(`dashboard after relogin: ${loc}`);
    }
    steps.push("✓ Dashboard après re-login");

    console.log(steps.join("\n"));
    console.log("\n✓ Bêta E2E OK");
  } catch (e) {
    console.log(steps.join("\n"));
    console.error("\n✗", e instanceof Error ? e.message : e);
    process.exitCode = 1;
  } finally {
    if (userId) {
      await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
        method: "DELETE",
        headers: adminHeaders(),
      });
    }
  }
})();
