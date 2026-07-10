/**
 * Applique uniquement uberly-beta-v3.sql (vue uberly_beta_vision_stats).
 * Usage : SUPABASE_DB_PASSWORD=... node scripts/apply-uberly-beta-v3.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const envPath = path.join(root, ".env.local");

for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq <= 0) continue;
  const key = trimmed.slice(0, eq).trim();
  const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
  if (!process.env[key]) process.env[key] = value;
}

const projectRef = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname.split(
  ".",
)[0];
const dbPassword = process.env.SUPABASE_DB_PASSWORD?.trim();
const dbUrl =
  process.env.SUPABASE_DB_URL?.trim() ||
  (dbPassword
    ? `postgresql://postgres.${projectRef}:${encodeURIComponent(dbPassword)}@aws-0-eu-west-1.pooler.supabase.com:6543/postgres`
    : null);

if (!dbUrl) {
  console.error(
    "✗ Définis SUPABASE_DB_PASSWORD ou SUPABASE_DB_URL dans .env.local",
  );
  process.exit(1);
}

const sql = fs.readFileSync(
  path.join(root, "supabase", "uberly-beta-v3.sql"),
  "utf8",
);

const client = new pg.Client({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  await client.query(sql);
  console.log("✓ uberly-beta-v3.sql appliqué (vue uberly_beta_vision_stats)");
} catch (e) {
  console.error("✗", e.message);
  process.exit(1);
} finally {
  await client.end();
}
