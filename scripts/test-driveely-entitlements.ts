/**
 * Tests unitaires entitlements / quota (sans réseau).
 * Mode env forcé en production pour des assertions catalogue stables.
 */
import assert from "node:assert/strict";

process.env.DRIVEELY_APP_MODE = "production";
delete process.env.NEXT_PUBLIC_DRIVEELY_APP_MODE;
delete process.env.DRIVEELY_BETA_MODE;

async function main() {
  const {
    getEntitlementsForPlan,
    isPaidPlan,
    planRank,
  } = await import("../lib/margeo/billing/entitlements");
  const {
    buildQuotaStatus,
    isQuotaExceeded,
  } = await import("../lib/margeo/services/quota-logic");

  const discovery = getEntitlementsForPlan("discovery");
  assert.equal(discovery.dailyAnalysisLimit, 2);
  assert.equal(discovery.canUnlimitedAnalysis, false);
  assert.equal(discovery.canExportCSV, false);
  assert.equal(discovery.historyDays, 3);

  const pro = getEntitlementsForPlan("pro");
  assert.equal(pro.canUnlimitedAnalysis, true);
  assert.equal(pro.canExportCSV, false);
  assert.equal(pro.canDashboardFull, true);
  assert.equal(pro.canAdvancedStats, false);

  const elite = getEntitlementsForPlan("elite");
  assert.equal(elite.canExportCSV, true);
  assert.equal(elite.canAdvancedStats, true);
  assert.equal(elite.canBetaFeatures, true);
  assert.equal(elite.canUnlimitedAnalysis, true); // hérite de Pro

  assert.equal(isPaidPlan("discovery"), false);
  assert.equal(isPaidPlan("pro"), true);
  assert.equal(planRank("elite") > planRank("pro"), true);

  assert.equal(isQuotaExceeded(2, 2, false), true);
  assert.equal(isQuotaExceeded(2, 2, true), false);
  assert.equal(buildQuotaStatus(true, 5, 2).remainingToday, null);
  assert.equal(buildQuotaStatus(false, 1, 2).remainingToday, 1);

  const { mapIOSProductId } = await import(
    "../lib/margeo/billing/app-store-products"
  );
  assert.deepEqual(mapIOSProductId("app.driveely.premium.monthly"), {
    planId: "pro",
    billingPeriod: "monthly",
  });
  assert.deepEqual(mapIOSProductId("app.driveely.premium.yearly"), {
    planId: "pro",
    billingPeriod: "yearly",
  });
  assert.equal(mapIOSProductId("app.driveely.ios.premium.monthly"), null);
  assert.equal(mapIOSProductId("app.driveely.ios.premium.annual"), null);
  assert.equal(mapIOSProductId("app.driveely.premium.annual"), null);

  console.log("✅ entitlements + quota logic OK");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
