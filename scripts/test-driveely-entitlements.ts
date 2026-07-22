/**
 * Tests unitaires entitlements / quota (sans réseau).
 */
import assert from "node:assert/strict";
import {
  getEntitlementsForPlan,
  isPaidPlan,
  planRank,
} from "../lib/margeo/billing/entitlements";
import {
  buildQuotaStatus,
  isQuotaExceeded,
} from "../lib/margeo/services/quota-logic";

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

console.log("✅ entitlements + quota logic OK");
