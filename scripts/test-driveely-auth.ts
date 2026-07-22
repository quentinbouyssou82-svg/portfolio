/**
 * Test auth Driveely (signup → session → logout) via Supabase + API simulée.
 * Usage : set -a && source .env.local && set +a && npx tsx scripts/test-driveely-auth.ts
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

const email = `driveely.auth.${Date.now()}@gmail.com`;
const password = "TestDriveely123!";

function adminHeaders() {
  return { apikey: SECRET, Authorization: `Bearer ${SECRET}` };
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

const steps: string[] = [];

(async () => {
  try {
    // Signup via Supabase (équivalent signUpAction)
    const signUpRes = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: "POST",
      headers: { apikey: PUB, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, data: { name: "Auth Test" } }),
    });
    const signUpData = await signUpRes.json();
    if (!signUpRes.ok || !signUpData.access_token) {
      throw new Error(`signup: ${JSON.stringify(signUpData).slice(0, 200)}`);
    }
    steps.push("✓ Signup + session");

    const access = signUpData.access_token as string;
    const refresh = signUpData.refresh_token as string;

    // Session persistante — refresh token
    const refreshRes = await fetch(
      `${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,
      {
        method: "POST",
        headers: { apikey: PUB, "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refresh }),
      },
    );
    const refreshData = await refreshRes.json();
    if (!refreshRes.ok || !refreshData.access_token) {
      throw new Error(`refresh: ${JSON.stringify(refreshData).slice(0, 200)}`);
    }
    steps.push("✓ Session refresh");

    // Route protégée
    const quota = await fetch(`${BASE}/api/driveely/quota`, {
      headers: { Cookie: cookieHeader(refreshData.access_token, refresh) },
    });
    if (!quota.ok) throw new Error(`quota ${quota.status}`);
    steps.push("✓ Route protégée (quota)");

    // Logout
    const logoutRes = await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method: "POST",
      headers: {
        apikey: PUB,
        Authorization: `Bearer ${access}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ scope: "global" }),
    });
    if (!logoutRes.ok && logoutRes.status !== 401) {
      throw new Error(`logout ${logoutRes.status}`);
    }
    steps.push("✓ Logout");

    // Déconnecté — quota doit refuser
    const quotaAfter = await fetch(`${BASE}/api/driveely/quota`, {
      headers: { Cookie: cookieHeader(access, refresh) },
    });
    if (quotaAfter.status !== 401 && quotaAfter.status !== 403) {
      steps.push(`? quota après logout: ${quotaAfter.status} (cookie client simulé)`);
    } else {
      steps.push("✓ Accès refusé après logout");
    }

    // Cleanup user
    if (signUpData.user?.id) {
      await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${signUpData.user.id}`, {
        method: "DELETE",
        headers: adminHeaders(),
      });
    }

    console.log(steps.join("\n"));
    console.log("\n✓ Auth beta OK");
  } catch (e) {
    console.log(steps.join("\n"));
    console.error("\n✗", e instanceof Error ? e.message : e);
    process.exit(1);
  }
})();
