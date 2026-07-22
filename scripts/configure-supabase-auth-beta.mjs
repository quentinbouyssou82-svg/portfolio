/**
 * Applique la config Auth recommandée pour la bêta Driveely via Management API.
 *
 * Prérequis :
 *   SUPABASE_ACCESS_TOKEN — https://supabase.com/dashboard/account/tokens
 *   NEXT_PUBLIC_SUPABASE_URL dans .env.local
 *
 * Usage :
 *   SUPABASE_ACCESS_TOKEN=sbp_... node scripts/configure-supabase-auth-beta.mjs
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

const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN?.trim();
const PROJECT_REF = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname.split(
  ".",
)[0];

if (!ACCESS_TOKEN) {
  console.error(
    "✗ SUPABASE_ACCESS_TOKEN requis.\n  Crée un token : https://supabase.com/dashboard/account/tokens",
  );
  process.exit(1);
}

/** Config bêta privée : pas de confirm email, limites souples, pas de captcha. */
const BETA_AUTH_CONFIG = {
  disable_signup: false,
  external_email_enabled: true,
  mailer_autoconfirm: true,
  security_captcha_enabled: false,
  rate_limit_anonymous_users: 30,
  rate_limit_email_sent: 30,
  rate_limit_sms_sent: 30,
  rate_limit_verify: 60,
  rate_limit_token_refresh: 180,
  rate_limit_otp: 60,
  rate_limit_web3: 30,
};

const res = await fetch(
  `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`,
  {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(BETA_AUTH_CONFIG),
  },
);

const body = await res.json().catch(() => ({}));

if (!res.ok) {
  console.error("✗ PATCH config/auth failed:", res.status, JSON.stringify(body).slice(0, 300));
  process.exit(1);
}

console.log("✓ Config Auth bêta appliquée sur", PROJECT_REF);
console.log("\nVérifie avec : node scripts/verify-supabase-auth-config.mjs");
