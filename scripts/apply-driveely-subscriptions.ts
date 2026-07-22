/**
 * Applique la migration abonnements via l'API SQL Supabase (si disponible)
 * ou vérifie l'état des tables.
 *
 * Usage: npx tsx scripts/apply-driveely-subscriptions.ts
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

async function main() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    console.error("SUPABASE_URL + SUPABASE_SECRET_KEY requis");
    process.exit(1);
  }

  const sb = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await sb.from("margeo_subscriptions").select("id").limit(1);
  if (!error) {
    console.log("✅ Table margeo_subscriptions déjà présente");
    return;
  }

  console.log("⚠️  Tables absentes:", error.message);
  console.log("");
  console.log(
    "Exécute le SQL suivant dans le SQL Editor Supabase (Dashboard → SQL):",
  );
  console.log("  supabase/driveely-subscriptions-v1.sql");
  console.log("");
  const sqlPath = resolve("supabase/driveely-subscriptions-v1.sql");
  const sql = readFileSync(sqlPath, "utf8");
  console.log("--- BEGIN SQL ---");
  console.log(sql);
  console.log("--- END SQL ---");
  process.exit(2);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
