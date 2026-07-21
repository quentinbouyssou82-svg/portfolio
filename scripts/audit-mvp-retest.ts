/**
 * Retest post-fix : quota Pro + 5 analyses + image invalide.
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
const email = "beta.qa.uberly.20260721@example.com";
const password = "UberlyBeta2026!";

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

async function main() {
  const tok = await fetch(
    `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: { apikey: PUB, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    },
  ).then((r) => r.json());
  if (!tok.access_token) throw new Error(JSON.stringify(tok));
  const cookie = cookieHeader(tok.access_token, tok.refresh_token);

  // Force re-activate to invalidate cache path
  const act = await fetch(`${BASE}/api/uberly/subscription/activate`, {
    method: "POST",
    headers: { Cookie: cookie, "Content-Type": "application/json" },
    body: JSON.stringify({ planId: "pro" }),
  });
  console.log("activate", act.status, JSON.stringify(await act.json()));

  const quota = await fetch(`${BASE}/api/uberly/quota`, {
    headers: { Cookie: cookie },
  }).then((r) => r.json());
  console.log("quota", JSON.stringify(quota));

  const files = fs
    .readdirSync(CAPTURES)
    .filter((f) => f.endsWith(".png"))
    .sort()
    .slice(0, 5);

  for (const f of files) {
    const buf = fs.readFileSync(path.join(CAPTURES, f));
    const form = new FormData();
    form.append("image", new Blob([buf], { type: "image/png" }), f);
    const t0 = Date.now();
    const res = await fetch(`${BASE}/api/uberly/analyze`, {
      method: "POST",
      headers: { Cookie: cookie },
      body: form,
    });
    const ms = Date.now() - t0;
    const body = await res.json();
    console.log(
      JSON.stringify({
        file: f,
        status: res.status,
        ms,
        ok: body.ok,
        code: body.code,
        score: body.analysis?.score,
        verdict: body.analysis?.verdict,
        platform: body.analysis?.offer?.platform,
        payout: body.analysis?.offer?.payout,
        explanation: String(body.analysis?.explanation || "").slice(0, 100),
      }),
    );
  }

  {
    const form = new FormData();
    form.append(
      "image",
      new Blob(["not-an-image"], { type: "text/plain" }),
      "bad.txt",
    );
    const res = await fetch(`${BASE}/api/uberly/analyze`, {
      method: "POST",
      headers: { Cookie: cookie },
      body: form,
    });
    console.log("invalid", res.status, JSON.stringify(await res.json()));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
