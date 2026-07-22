/**
 * Vérifie que le schéma Driveely est présent sur le projet Supabase.
 * Usage : node scripts/verify-supabase-driveely.mjs
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
const KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SECRET_KEY =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY;

const TABLES = [
  "margeo_profiles",
  "margeo_rides",
  "margeo_analyses",
  "margeo_feedback",
  "margeo_location_logs",
  "margeo_beta_events",
];

async function tableExists(name) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${name}?select=id&limit=1`, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
  });
  if (res.status === 404) {
    const body = await res.json().catch(() => ({}));
    return body?.code === "PGRST205" ? false : null;
  }
  return res.ok;
}

console.log("Driveely — vérification schéma Supabase\n", SUPABASE_URL, "\n");

let ok = true;
for (const table of TABLES) {
  const exists = await tableExists(table);
  const label = exists === true ? "✓" : exists === false ? "✗" : "?";
  console.log(label, table, exists === false ? "(absente)" : exists === true ? "" : "(erreur réseau)");
  if (!exists) ok = false;
}

const bucketKey = SECRET_KEY || KEY;
const bucketRes = await fetch(`${SUPABASE_URL}/storage/v1/bucket/driveely-screenshots`, {
  headers: { apikey: bucketKey, Authorization: `Bearer ${bucketKey}` },
});
console.log(
  bucketRes.ok ? "✓" : "✗",
  "storage:driveely-screenshots",
  bucketRes.ok ? "" : `(HTTP ${bucketRes.status})`,
);
if (!bucketRes.ok) ok = false;

const VIEWS = [
  "driveely_beta_stats",
  "driveely_beta_funnel",
  "driveely_beta_errors",
  "driveely_beta_vision_stats",
];
for (const view of VIEWS) {
  const viewRes = await fetch(`${SUPABASE_URL}/rest/v1/${view}?select=*&limit=1`, {
    headers: { apikey: bucketKey, Authorization: `Bearer ${bucketKey}` },
  });
  console.log(viewRes.ok ? "✓" : "✗", `view:${view}`, viewRes.ok ? "" : `(HTTP ${viewRes.status})`);
  if (!viewRes.ok) ok = false;
}

console.log(
  ok
    ? "\n✓ Schéma Driveely complet"
    : "\n✗ Migrations manquantes — voir supabase/DRIVEELY-MIGRATIONS.md",
);
process.exit(ok ? 0 : 1);
