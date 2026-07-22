#!/usr/bin/env node
/**
 * Smoke test endpoints Driveely (sans auth).
 * Usage : node scripts/driveely-smoke.mjs [baseUrl]
 * Default : http://localhost:3000
 */

const base = process.argv[2]?.replace(/\/$/, "") || "http://localhost:3000";

async function check(path, label) {
  try {
    const res = await fetch(`${base}${path}`);
    const data = await res.json().catch(() => ({}));
    const ok = res.ok;
    console.log(ok ? "✓" : "✗", label, res.status, ok ? "" : JSON.stringify(data).slice(0, 80));
    return ok;
  } catch (e) {
    console.log("✗", label, e.message);
    return false;
  }
}

console.log(`Driveely smoke — ${base}\n`);

let ok = true;
ok = (await check("/api/driveely/health", "GET /api/driveely/health")) && ok;

const health = await fetch(`${base}/api/driveely/health`).then((r) => r.json()).catch(() => null);
if (health) {
  console.log("\nreadyForBeta:", health.readyForBeta);
  if (health.missing?.length) console.log("missing:", health.missing.join(", "));
}

console.log(ok ? "\n✓ Smoke OK" : "\n✗ Smoke failed — lancer npm run dev ou vérifier deploy");
process.exit(ok ? 0 : 1);
