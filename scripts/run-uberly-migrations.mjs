/**
 * Exécute les migrations Uberly sur Supabase via connexion Postgres.
 * Nécessite SUPABASE_DB_PASSWORD (Dashboard → Settings → Database).
 * Usage : SUPABASE_DB_PASSWORD=... node scripts/run-uberly-migrations.mjs
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

const PROJECT_REF = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname.split(
  ".",
)[0];
const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD?.trim();
const DB_URL =
  process.env.SUPABASE_DB_URL?.trim() ||
  (DB_PASSWORD
    ? `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(DB_PASSWORD)}@aws-0-eu-west-1.pooler.supabase.com:6543/postgres`
    : null);

const MIGRATIONS = [
  "margeo-setup.sql",
  "margeo-rls.sql",
  "uberly-migrate.sql",
  "uberly-backend-v2.sql",
  "uberly-beta.sql",
  "uberly-beta-v2.sql",
  "uberly-beta-v3.sql",
];

if (!DB_URL) {
  console.error(
    "✗ Définis SUPABASE_DB_PASSWORD ou SUPABASE_DB_URL pour exécuter les migrations.",
  );
  process.exit(1);
}

const client = new pg.Client({
  connectionString: DB_URL,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  await client.connect();
  console.log("✓ Connecté à Postgres\n");

  for (const file of MIGRATIONS) {
    const sql = fs.readFileSync(path.join(root, "supabase", file), "utf8");
    process.stdout.write(`→ ${file} … `);
    try {
      await client.query(sql);
      console.log("OK");
    } catch (e) {
      console.log("ERREUR");
      console.error(e.message);
      throw e;
    }
  }

  console.log("\n✓ Toutes les migrations exécutées");
}

run()
  .catch((e) => {
    console.error("\n✗", e.message);
    process.exit(1);
  })
  .finally(() => client.end());
