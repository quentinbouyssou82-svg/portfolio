/**
 * Crée un ou plusieurs codes bêta Premium (6 caractères).
 *
 * Usage:
 *   npx tsx scripts/create-beta-codes.ts
 *   npx tsx scripts/create-beta-codes.ts --count 5
 *   npx tsx scripts/create-beta-codes.ts --uses 3 --note "équipe Lyon"
 *   npx tsx scripts/create-beta-codes.ts --code AB7KQ2
 *   npx tsx scripts/create-beta-codes.ts --expires 2026-12-31
 *
 * Prérequis: migration driveely-beta-codes-v1.sql appliquée + .env.local
 * (SUPABASE_URL + SUPABASE_SECRET_KEY / SERVICE_ROLE).
 */

import fs from "node:fs";
import path from "node:path";
import { createBetaCode } from "../lib/margeo/services/beta-codes";

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed
      .slice(eq + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

function argValue(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  if (idx < 0) return undefined;
  return process.argv[idx + 1];
}

async function main() {
  loadEnvLocal();

  const count = Math.max(1, Number(argValue("--count") ?? "1") || 1);
  const maxUses = Math.max(1, Number(argValue("--uses") ?? "1") || 1);
  const note = argValue("--note") ?? null;
  const expires = argValue("--expires") ?? null;
  const explicit = argValue("--code") ?? null;

  if (explicit && count > 1) {
    console.error("✗ --code et --count > 1 sont incompatibles");
    process.exit(1);
  }

  console.log(
    `Création de ${explicit ? 1 : count} code(s) (max_uses=${maxUses})…\n`,
  );

  const created: string[] = [];
  for (let i = 0; i < (explicit ? 1 : count); i++) {
    const row = await createBetaCode({
      maxUses,
      note,
      expiresAt: expires,
      code: explicit,
    });
    created.push(row.code);
    const display = `${row.code.slice(0, 3)}-${row.code.slice(3)}`;
    console.log(`✓ ${display}  (${row.code})`);
    if (row.note) console.log(`  note: ${row.note}`);
    if (row.expiresAt) console.log(`  expire: ${row.expiresAt}`);
    console.log(`  uses: 0/${row.maxUses}`);
  }

  console.log("\nÀ envoyer au livreur (copier-coller) :");
  for (const code of created) {
    console.log(`  ${code.slice(0, 3)}-${code.slice(3)}`);
  }
}

main().catch((e) => {
  console.error("\n✗", e instanceof Error ? e.message : e);
  process.exit(1);
});
