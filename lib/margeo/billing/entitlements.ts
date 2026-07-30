/**
 * Entitlements / feature flags — source de vérité par plan.
 * Toutes les vérifications métier doivent passer par ici (serveur).
 * En mode app bêta : Elite pour tous via `getEntitlementsForPlan`.
 */

import type { DriveelyPlanId } from "@/lib/margeo/plans";
import {
  getAppFeatures,
  getAppFeaturesAsync,
  type DriveelyFeatures,
} from "@/lib/margeo/config";

export type PlanEntitlements = {
  planId: DriveelyPlanId;
  /** Peut lancer une analyse (dans la limite). */
  canAnalyze: boolean;
  /** null = illimité */
  dailyAnalysisLimit: number | null;
  canUnlimitedAnalysis: boolean;
  /** Historique : null = illimité */
  historyDays: number | null;
  canUnlimitedHistory: boolean;
  canDashboardFull: boolean;
  canZones: boolean;
  canAdvancedStats: boolean;
  canExportCSV: boolean;
  canAdvancedInsights: boolean;
  canPrioritySupport: boolean;
  canBetaFeatures: boolean;
};

const DISCOVERY: PlanEntitlements = {
  planId: "discovery",
  canAnalyze: true,
  dailyAnalysisLimit: 2,
  canUnlimitedAnalysis: false,
  historyDays: 3,
  canUnlimitedHistory: false,
  canDashboardFull: false,
  canZones: false,
  canAdvancedStats: false,
  canExportCSV: false,
  canAdvancedInsights: false,
  canPrioritySupport: false,
  canBetaFeatures: false,
};

const PRO: PlanEntitlements = {
  planId: "pro",
  canAnalyze: true,
  dailyAnalysisLimit: null,
  canUnlimitedAnalysis: true,
  historyDays: null,
  canUnlimitedHistory: true,
  canDashboardFull: true,
  canZones: true,
  canAdvancedStats: false,
  canExportCSV: false,
  canAdvancedInsights: false,
  canPrioritySupport: false,
  canBetaFeatures: false,
};

const ELITE: PlanEntitlements = {
  ...PRO,
  planId: "elite",
  canAdvancedStats: true,
  canExportCSV: true,
  canAdvancedInsights: true,
  canPrioritySupport: true,
  canBetaFeatures: true,
};

export const PLAN_ENTITLEMENTS: Record<DriveelyPlanId, PlanEntitlements> = {
  discovery: DISCOVERY,
  pro: PRO,
  elite: ELITE,
};

/** Entitlements bruts du catalogue (sans override environnement). */
export function getCatalogEntitlementsForPlan(
  planId: DriveelyPlanId,
): PlanEntitlements {
  return PLAN_ENTITLEMENTS[planId] ?? DISCOVERY;
}

/**
 * Entitlements effectifs. Sur le serveur, préférer `getEntitlementsForPlanAsync`.
 * Sync OK côté client (cookie) ou scripts avec mode env.
 */
export function getEntitlementsForPlan(planId: DriveelyPlanId): PlanEntitlements {
  return applyFeatureOverrides(planId, getAppFeatures());
}

export async function getEntitlementsForPlanAsync(
  planId: DriveelyPlanId,
): Promise<PlanEntitlements> {
  return applyFeatureOverrides(planId, await getAppFeaturesAsync());
}

function applyFeatureOverrides(
  planId: DriveelyPlanId,
  feats: DriveelyFeatures,
): PlanEntitlements {
  if (feats.allPremiumUnlocked || !feats.freemiumLimits) {
    return { ...ELITE, planId };
  }
  return getCatalogEntitlementsForPlan(planId);
}

export function isPaidPlan(planId: DriveelyPlanId): boolean {
  return planId === "pro" || planId === "elite";
}

export function planRank(planId: DriveelyPlanId): number {
  switch (planId) {
    case "discovery":
      return 0;
    case "pro":
      return 1;
    case "elite":
      return 2;
    default:
      return 0;
  }
}
