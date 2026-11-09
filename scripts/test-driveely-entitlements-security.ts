/**
 * Regression: entitlements / billing ignore client beta cookie & header spoof.
 *
 * Usage: npx tsx scripts/test-driveely-entitlements-security.ts
 */
import assert from "node:assert/strict";
import {
  getCatalogEntitlementsForPlan,
  getEntitlementsForPlan,
  getEntitlementsForPlanAsync,
} from "../lib/margeo/billing/entitlements";
import {
  getBillingFeatures,
  getTrustedAppMode,
} from "../lib/margeo/config";

async function main() {
  const prevMode = process.env.DRIVEELY_APP_MODE;
  const prevPublic = process.env.NEXT_PUBLIC_DRIVEELY_APP_MODE;
  const prevBeta = process.env.DRIVEELY_BETA_MODE;

  process.env.DRIVEELY_APP_MODE = "production";
  delete process.env.NEXT_PUBLIC_DRIVEELY_APP_MODE;
  delete process.env.DRIVEELY_BETA_MODE;

  assert.equal(getTrustedAppMode(), "production");
  const billing = getBillingFeatures();
  assert.equal(billing.allPremiumUnlocked, false);
  assert.equal(billing.freemiumLimits, true);
  assert.equal(billing.billing, true);

  // Spoof-like: even if UI cookie would say beta, billing features stay production.
  const discovery = getEntitlementsForPlan("discovery");
  assert.equal(discovery.dailyAnalysisLimit, 2);
  assert.equal(discovery.canExportCSV, false);
  assert.equal(discovery.planId, "discovery");

  const asyncDiscovery = await getEntitlementsForPlanAsync("discovery");
  assert.deepEqual(asyncDiscovery, discovery);

  // Allowlisted beta tester unlocks Elite on production.
  const betaElite = await getEntitlementsForPlanAsync("discovery", {
    isBetaTester: true,
  });
  assert.equal(betaElite.canExportCSV, true);
  assert.equal(betaElite.canUnlimitedAnalysis, true);
  assert.equal(betaElite.planId, "discovery"); // label kept; caps = Elite

  // Catalog path unchanged.
  assert.equal(getCatalogEntitlementsForPlan("pro").canUnlimitedAnalysis, true);

  // Trusted env beta unlocks for everyone (staging/dev only).
  process.env.DRIVEELY_APP_MODE = "beta";
  assert.equal(getTrustedAppMode(), "beta");
  const betaEnv = getEntitlementsForPlan("discovery");
  assert.equal(betaEnv.canExportCSV, true);

  // Restore
  if (prevMode !== undefined) process.env.DRIVEELY_APP_MODE = prevMode;
  else delete process.env.DRIVEELY_APP_MODE;
  if (prevPublic !== undefined) {
    process.env.NEXT_PUBLIC_DRIVEELY_APP_MODE = prevPublic;
  }
  if (prevBeta !== undefined) process.env.DRIVEELY_BETA_MODE = prevBeta;

  console.log("✅ entitlements security (no client beta spoof) OK");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
