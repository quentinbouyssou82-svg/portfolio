/**
 * Test parcours auth email Uberly (signup → onboarding → dashboard → logout → login).
 * Usage : set -a && source .env.local && set +a && npx tsx scripts/test-uberly-email-flow.ts
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
const name = "Flow Test";

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

async function adminCreateUser() {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: { ...adminHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`adminCreateUser: ${JSON.stringify(data)}`);
  return data.id as string;
}

async function signInPassword() {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: PUB, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`signIn: ${JSON.stringify(data)}`);
  return data as { access_token: string; refresh_token: string };
}

async function adminDeleteUser(userId: string) {
  await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
    method: "DELETE",
    headers: adminHeaders(),
  });
}

(async () => {
  let userId = "";
  let access = "";
  let refresh = "";

  try {
    const signUpRes = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: "POST",
      headers: { apikey: PUB, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, data: { name } }),
    });
    const signUpData = await signUpRes.json();

    if (!signUpRes.ok) {
      if (signUpData.error_code === "over_email_send_rate_limit") {
        userId = await adminCreateUser();
        const session = await signInPassword();
        access = session.access_token;
        refresh = session.refresh_token;
        steps.push("✓ Signup (admin fallback rate limit) + session");
      } else {
        throw new Error(`signup: ${JSON.stringify(signUpData).slice(0, 200)}`);
      }
    } else {
      userId = signUpData.user?.id ?? "";

      if (!signUpData.access_token) {
        if (!userId) {
          userId = await adminCreateUser();
        } else {
          await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
            method: "PUT",
            headers: { ...adminHeaders(), "Content-Type": "application/json" },
            body: JSON.stringify({ email_confirm: true }),
          });
        }
        const session = await signInPassword();
        access = session.access_token;
        refresh = session.refresh_token;
      } else {
        access = signUpData.access_token;
        refresh = signUpData.refresh_token;
      }
      steps.push("✓ Signup + session");
    }

    const profileRes = await fetch(
      `${SUPABASE_URL}/rest/v1/margeo_profiles?id=eq.${userId}&select=id,onboarding_completed`,
      { headers: adminHeaders() },
    );
    const profiles = await profileRes.json();
    if (!profileRes.ok || !profiles[0]?.id) {
      throw new Error(`profil manquant: ${JSON.stringify(profiles)}`);
    }
    steps.push("✓ Profil auto-créé");

    const onboardingRes = await fetch(`${BASE}/demos/uberly/onboarding`, {
      headers: { Cookie: cookieHeader(access, refresh) },
      redirect: "manual",
    });
    if (onboardingRes.status >= 400) {
      throw new Error(`onboarding ${onboardingRes.status}`);
    }
    steps.push("✓ Onboarding accessible (non complété)");

    const patchRes = await fetch(
      `${SUPABASE_URL}/rest/v1/margeo_profiles?id=eq.${userId}`,
      {
        method: "PATCH",
        headers: {
          ...adminHeaders(),
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
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
      },
    );
    if (!patchRes.ok) {
      throw new Error(`onboarding patch: ${(await patchRes.text()).slice(0, 200)}`);
    }
    steps.push("✓ Onboarding complété");

    const dashRes = await fetch(`${BASE}/demos/uberly/dashboard`, {
      headers: { Cookie: cookieHeader(access, refresh) },
      redirect: "manual",
    });
    const dashLoc = dashRes.headers.get("location") ?? "";
    if (dashLoc.includes("/login") || dashLoc.includes("/onboarding")) {
      throw new Error(`dashboard redirect: ${dashLoc}`);
    }
    if (dashRes.status >= 400 && dashRes.status !== 307 && dashRes.status !== 308) {
      throw new Error(`dashboard ${dashRes.status}`);
    }
    steps.push("✓ Dashboard accessible");

    const refreshRes = await fetch(
      `${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,
      {
        method: "POST",
        headers: { apikey: PUB, "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refresh }),
      },
    );
    const refreshData = await refreshRes.json();
    if (!refreshRes.ok) throw new Error(`refresh: ${JSON.stringify(refreshData)}`);
    access = refreshData.access_token;
    refresh = refreshData.refresh_token;
    steps.push("✓ Session refresh");

    await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method: "POST",
      headers: {
        apikey: PUB,
        Authorization: `Bearer ${access}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ scope: "global" }),
    });
    steps.push("✓ Logout");

    const relogin = await signInPassword();
    access = relogin.access_token;
    refresh = relogin.refresh_token;
    steps.push("✓ Re-login");

    const dash2 = await fetch(`${BASE}/demos/uberly/dashboard`, {
      headers: { Cookie: cookieHeader(access, refresh) },
      redirect: "manual",
    });
    const loc2 = dash2.headers.get("location") ?? "";
    if (loc2.includes("/login") || loc2.includes("/onboarding")) {
      throw new Error(`dashboard after relogin: ${loc2}`);
    }
    steps.push("✓ Dashboard après re-login");

    console.log(steps.join("\n"));
    console.log("\n✓ Parcours auth email OK");
  } catch (e) {
    console.log(steps.join("\n"));
    console.error("\n✗", e instanceof Error ? e.message : e);
    process.exitCode = 1;
  } finally {
    if (userId) await adminDeleteUser(userId);
  }
})();
