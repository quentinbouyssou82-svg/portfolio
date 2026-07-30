import type { UserProfile } from "../types";
import { isPaidPlan } from "@/lib/margeo/billing/entitlements";
import {
  getAppFeatures,
  getAppFeaturesAsync,
  getAppMode,
  getAppModeAsync,
  type DriveelyFeatures,
} from "@/lib/margeo/config";
import { getCurrentSubscription } from "@/lib/margeo/services/subscription";

export type PremiumSource = "manual" | "beta" | "stripe" | "trial" | "app_mode";

export interface PremiumStatus {
  /** Abonnement / flag DB réellement payant. */
  isPremium: boolean;
  /**
   * Accès effectif aux capacités premium (abonnement OU mode app bêta).
   * En APP_MODE=beta → true pour tous, sans écrire premium en base.
   */
  effectivePremium: boolean;
  /** D'où vient le déblocage effectif. */
  unlockSource: PremiumSource | null;
  source: PremiumSource | null;
  expiresAt: string | null;
  planId: "discovery" | "pro" | "elite";
  appMode: "production" | "beta";
  billingEnabled: boolean;
  freemiumLimits: boolean;
}

function resolveWithFeatures(
  profile: Pick<
    UserProfile,
    "premium" | "premiumUntil" | "premiumSource" | "planId"
  >,
  feats: DriveelyFeatures,
  appMode: "production" | "beta",
): PremiumStatus {
  const planId = profile.planId ?? (profile.premium ? "pro" : "discovery");

  const base: PremiumStatus = {
    isPremium: false,
    effectivePremium: false,
    unlockSource: null,
    source: null,
    expiresAt: null,
    planId: "discovery",
    appMode,
    billingEnabled: feats.billing,
    freemiumLimits: feats.freemiumLimits,
  };

  if (!profile.premium && !isPaidPlan(planId)) {
    if (feats.allPremiumUnlocked) {
      return {
        ...base,
        effectivePremium: true,
        unlockSource: "app_mode",
        planId,
      };
    }
    return { ...base, planId: "discovery" };
  }

  if (profile.premiumUntil) {
    const expires = new Date(profile.premiumUntil);
    if (expires.getTime() < Date.now()) {
      if (feats.allPremiumUnlocked) {
        return {
          ...base,
          source: profile.premiumSource ?? null,
          expiresAt: profile.premiumUntil,
          effectivePremium: true,
          unlockSource: "app_mode",
          planId,
        };
      }
      return {
        ...base,
        source: profile.premiumSource ?? null,
        expiresAt: profile.premiumUntil,
        planId: "discovery",
      };
    }
  }

  const paid = isPaidPlan(planId) || profile.premium;
  return {
    ...base,
    isPremium: paid,
    effectivePremium: paid || feats.allPremiumUnlocked,
    unlockSource: paid
      ? (profile.premiumSource ?? "manual")
      : feats.allPremiumUnlocked
        ? "app_mode"
        : null,
    source: profile.premiumSource ?? "manual",
    expiresAt: profile.premiumUntil ?? null,
    planId: isPaidPlan(planId) ? planId : profile.premium ? "pro" : "discovery",
  };
}

/** Compat legacy + abonnement. Sync = client cookie / env default. */
export function resolvePremiumStatus(
  profile: Pick<
    UserProfile,
    "premium" | "premiumUntil" | "premiumSource" | "planId"
  >,
): PremiumStatus {
  return resolveWithFeatures(profile, getAppFeatures(), getAppMode());
}

export function isUserPremium(
  profile: Pick<
    UserProfile,
    "premium" | "premiumUntil" | "premiumSource" | "planId"
  >,
): boolean {
  return resolvePremiumStatus(profile).effectivePremium;
}

export async function resolvePremiumStatusForUser(
  userId: string,
): Promise<PremiumStatus> {
  const feats = await getAppFeaturesAsync();
  const appMode = await getAppModeAsync();
  const sub = await getCurrentSubscription(userId);
  const paid = isPaidPlan(sub.planId);
  const source: PremiumSource | null = paid
    ? sub.provider === "stripe"
      ? "stripe"
      : "trial"
    : null;

  return {
    isPremium: paid,
    effectivePremium: paid || feats.allPremiumUnlocked,
    unlockSource: paid ? source : feats.allPremiumUnlocked ? "app_mode" : null,
    source,
    expiresAt: sub.currentPeriodEnd,
    planId: sub.planId,
    appMode,
    billingEnabled: feats.billing,
    freemiumLimits: feats.freemiumLimits,
  };
}
