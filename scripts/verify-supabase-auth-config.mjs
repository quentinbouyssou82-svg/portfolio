/**
 * Vérifie la config Auth Supabase pour la bêta Uberly.
 * Usage : set -a && source .env.local && set +a && node scripts/verify-supabase-auth-config.mjs
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

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SECRET = process.env.SUPABASE_SECRET_KEY;
const PUB =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const PROJECT_REF = new URL(SUPABASE_URL).hostname.split(".")[0];
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN?.trim();

let allOk = true;

function pass(label, detail = "") {
  console.log("✓", label, detail ? `— ${detail}` : "");
}
function fail(label, detail = "") {
  console.log("✗", label, detail ? `— ${detail}` : "");
  allOk = false;
}

console.log("Uberly — vérification Auth Supabase\n", SUPABASE_URL, "\n");

const settingsRes = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
  headers: { apikey: SECRET, Authorization: `Bearer ${SECRET}` },
});
if (!settingsRes.ok) {
  fail("Auth settings", `HTTP ${settingsRes.status}`);
  process.exit(1);
}
const settings = await settingsRes.json();

if (settings.external?.email) pass("Email provider", "activé");
else fail("Email provider", "désactivé");

if (settings.mailer_autoconfirm) pass("Confirm email", "OFF (mailer_autoconfirm=true)");
else fail("Confirm email", "ON — désactiver dans Dashboard (Providers → Email)");

if (!settings.disable_signup) pass("Signups", "autorisés");
else fail("Signups", "disable_signup=true");

if (!settings.external?.google) pass("Google OAuth", "désactivé (OK bêta)");
else fail("Google OAuth", "activé côté Supabase (inutile pour l'instant)");

if (ACCESS_TOKEN) {
  const mgmtRes = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`,
    { headers: { Authorization: `Bearer ${ACCESS_TOKEN}` } },
  );
  if (mgmtRes.ok) {
    const cfg = await mgmtRes.json();
    const limits = Object.fromEntries(
      Object.entries(cfg).filter(([k]) => k.startsWith("rate_limit_")),
    );
    console.log("\nRate limits (Management API) :");
    for (const [k, v] of Object.entries(limits)) {
      console.log(`  ${k}: ${v}`);
    }
    if (cfg.security_captcha_enabled) {
      fail("Captcha", "activé — peut bloquer les tests");
    } else {
      pass("Captcha", "désactivé");
    }
  } else {
    console.log("\n? Management API:", mgmtRes.status, "(token invalide ou expiré)");
  }
} else {
  console.log(
    "\n○ SUPABASE_ACCESS_TOKEN absent — rate limits / captcha non vérifiés via API.",
  );
  console.log("  Token : https://supabase.com/dashboard/account/tokens");
}

console.log("\nTest signup (session immédiate attendue si autoconfirm ON) :");
const testEmail = `uberly.verify.${Date.now()}@gmail.com`;
const signUpRes = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
  method: "POST",
  headers: { apikey: PUB, "Content-Type": "application/json" },
  body: JSON.stringify({ email: testEmail, password: "TestUberly123!" }),
});
const signUpBody = await signUpRes.json();
if (signUpBody.access_token) {
  pass("Signup test", "session créée");
  await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${signUpBody.user?.id}`, {
    method: "DELETE",
    headers: { apikey: SECRET, Authorization: `Bearer ${SECRET}` },
  });
} else if (signUpBody.msg?.includes("rate limit")) {
  fail("Signup test", signUpBody.msg);
} else if (!settings.mailer_autoconfirm) {
  fail("Signup test", "pas de session (confirm email probablement ON)");
} else {
  fail("Signup test", JSON.stringify(signUpBody).slice(0, 120));
}

console.log(allOk ? "\n✓ Config Auth OK pour la bêta" : "\n✗ Corrections Dashboard requises");
process.exit(allOk ? 0 : 1);
