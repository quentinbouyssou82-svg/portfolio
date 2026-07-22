/**
 * Audit MVP — session bêta déjà créée (email/password en args ou env).
 * Usage:
 *   set -a && source .env.local && set +a
 *   npx tsx scripts/audit-mvp-beta-session.ts
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
const BASE = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const CAPTURES = path.join(__dirname, "fixtures/captures");
const email = process.env.DRIVEELY_BETA_EMAIL || "beta.qa.driveely.20260721@example.com";
const password = process.env.DRIVEELY_BETA_PASSWORD || "DriveelyBeta2026!";

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

async function signIn() {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: PUB, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data as {
    access_token: string;
    refresh_token: string;
    user: { id: string };
  };
}

async function analyze(cookie: string, filePath: string) {
  const buf = fs.readFileSync(filePath);
  const form = new FormData();
  form.append(
    "image",
    new Blob([buf], { type: "image/png" }),
    path.basename(filePath),
  );
  const t0 = Date.now();
  const res = await fetch(`${BASE}/api/driveely/analyze`, {
    method: "POST",
    headers: { Cookie: cookie },
    body: form,
  });
  const ms = Date.now() - t0;
  const body = await res.json().catch(async () => ({ raw: await res.text() }));
  return { status: res.status, ms, body };
}

async function main() {
  const session = await signIn();
  const cookie = cookieHeader(session.access_token, session.refresh_token);
  console.log("user", session.user.id);

  const files = fs
    .readdirSync(CAPTURES)
    .filter((f) => f.endsWith(".png"))
    .sort()
    .slice(0, 5);

  const results: unknown[] = [];
  for (const f of files) {
    const r = await analyze(cookie, path.join(CAPTURES, f));
    const a = r.body?.analysis;
    const row = {
      file: f,
      status: r.status,
      ms: r.ms,
      ok: r.body?.ok,
      code: r.body?.code || r.body?.error?.code,
      message: r.body?.message || r.body?.error?.message || r.body?.error,
      score: a?.score,
      verdict: a?.verdict,
      platform: a?.offer?.platform,
      payout: a?.offer?.payout,
      explanation: String(a?.explanation || "").slice(0, 120),
      id: a?.id,
    };
    results.push(row);
    console.log(JSON.stringify(row));
  }

  {
    const form = new FormData();
    form.append(
      "image",
      new Blob(["not-an-image"], { type: "text/plain" }),
      "bad.txt",
    );
    const res = await fetch(`${BASE}/api/driveely/analyze`, {
      method: "POST",
      headers: { Cookie: cookie },
      body: form,
    });
    console.log(
      "invalid",
      res.status,
      JSON.stringify(await res.json().catch(() => null)),
    );
  }

  const quota = await fetch(`${BASE}/api/driveely/quota`, {
    headers: { Cookie: cookie },
  });
  console.log("quota", JSON.stringify(await quota.json()));

  const act = await fetch(`${BASE}/api/driveely/subscription/activate`, {
    method: "POST",
    headers: { Cookie: cookie, "Content-Type": "application/json" },
    body: JSON.stringify({ planId: "pro" }),
  });
  console.log(
    "activate",
    act.status,
    JSON.stringify(await act.json().catch(() => null)),
  );

  // Retry remaining failures after Pro
  for (const f of files) {
    const prev = results.find(
      (r) => (r as { file: string }).file === f,
    ) as { ok?: boolean; file: string };
    if (prev?.ok) continue;
    const r = await analyze(cookie, path.join(CAPTURES, f));
    const a = r.body?.analysis;
    const row = {
      file: f,
      retry: true,
      status: r.status,
      ms: r.ms,
      ok: r.body?.ok,
      code: r.body?.code || r.body?.error?.code,
      message: r.body?.message || r.body?.error?.message || r.body?.error,
      score: a?.score,
      verdict: a?.verdict,
      platform: a?.offer?.platform,
      payout: a?.offer?.payout,
      explanation: String(a?.explanation || "").slice(0, 120),
      id: a?.id,
    };
    console.log(JSON.stringify(row));
  }

  const hist = await fetch(`${BASE}/demos/driveely/historique`, {
    headers: { Cookie: cookie, Accept: "text/html" },
    redirect: "manual",
  });
  console.log("historique_status", hist.status);

  fs.writeFileSync(
    path.join(__dirname, "fixtures/audit-mvp-results.json"),
    JSON.stringify({ email, results, at: new Date().toISOString() }, null, 2),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
