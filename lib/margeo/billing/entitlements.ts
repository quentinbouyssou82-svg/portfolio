/**
 * Entitlements / feature flags — source de vérité par plan.
 * Toutes les vérifications métier doivent passer par ici (serveur).
 */

import type { DriveelyPlanId } from "@/lib/margeo/plans";

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

export function getEntitlementsForPlan(planId: DriveelyPlanId): PlanEntitlements {
  return PLAN_ENTITLEMENTS[planId] ?? DISCOVERY;
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
