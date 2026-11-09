/**
 * Vérifie le garde-fou beta+production (sans lancer le build).
 * Usage : npx tsx scripts/test-assert-production-safe.ts
 */

import { assertProductionSafeConfig } from "../lib/margeo/config/assert-production-safe";

const saved = { ...process.env };
const tests: { name: string; ok: boolean }[] = [];

function assert(name: string, fn: () => void) {
  try {
    fn();
    tests.push({ name, ok: true });
    console.log("✓", name);
  } catch {
    tests.push({ name, ok: false });
    console.log("✗", name);
  } finally {
    Object.assign(process.env, saved);
  }
}

assert("dev local : beta autorisé", () => {
  process.env.VERCEL_ENV = "development";
  process.env.DRIVEELY_APP_MODE = "beta";
  assertProductionSafeConfig();
});

assert("preview Vercel : beta autorisé", () => {
  process.env.VERCEL_ENV = "preview";
  process.env.DRIVEELY_APP_MODE = "beta";
  assertProductionSafeConfig();
});

assert("production Vercel + APP_MODE=production : OK", () => {
  process.env.VERCEL_ENV = "production";
  process.env.DRIVEELY_APP_MODE = "production";
  delete process.env.NEXT_PUBLIC_DRIVEELY_APP_MODE;
  assertProductionSafeConfig();
});

assert("production Vercel + APP_MODE=beta : BLOQUÉ", () => {
  process.env.VERCEL_ENV = "production";
  process.env.DRIVEELY_APP_MODE = "beta";
  let threw = false;
  try {
    assertProductionSafeConfig();
  } catch (e) {
    threw = e instanceof Error && e.message.includes("DÉPLOIEMENT BLOQUÉ");
  }
  if (!threw) throw new Error("expected throw");
});

assert("production Vercel + NEXT_PUBLIC beta : BLOQUÉ", () => {
  process.env.VERCEL_ENV = "production";
  delete process.env.DRIVEELY_APP_MODE;
  process.env.NEXT_PUBLIC_DRIVEELY_APP_MODE = "beta";
  let threw = false;
  try {
    assertProductionSafeConfig();
  } catch (e) {
    threw = e instanceof Error && e.message.includes("DÉPLOIEMENT BLOQUÉ");
  }
  if (!threw) throw new Error("expected throw");
});

const failed = tests.filter((t) => !t.ok).length;
console.log(`\n${tests.length - failed}/${tests.length} tests OK`);
process.exit(failed > 0 ? 1 : 0);
