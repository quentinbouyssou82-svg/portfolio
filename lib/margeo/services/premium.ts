import type { UserProfile } from "../types";
import { isPaidPlan } from "@/lib/margeo/billing/entitlements";
import {
  getBillingFeatures,
  getBillingFeaturesAsync,
  getTrustedAppMode,
  type DriveelyFeatures,
} from "@/lib/margeo/config";
import { getCurrentSubscription } from "@/lib/margeo/services/subscription";
import { isBetaTester } from "@/lib/margeo/services/beta-user";

export type PremiumSource = "manual" | "beta" | "stripe" | "trial" | "app_mode";

export interface PremiumStatus {
  /** Abonnement / flag DB réellement payant. */
  isPremium: boolean;
  /**
   * Accès effectif aux capacités premium (abonnement OU unlock trusted).
   * Unlock : env APP_MODE=beta OU is_beta_tester — jamais cookie/header.
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
  trialEndsAt: string | null;
  recoveryOfferEligible: boolean;
}

function resolveWithFeatures(
  profile: Pick<
    UserProfile,
    "premium" | "premiumUntil" | "premiumSource" | "planId" | "isBetaTester"
  >,
  feats: DriveelyFeatures,
  appMode: "production" | "beta",
): PremiumStatus {
  const planId = profile.planId ?? (profile.premium ? "pro" : "discovery");
  const unlocked =
    feats.allPremiumUnlocked || Boolean(profile.isBetaTester);

  const base: PremiumStatus = {
    isPremium: false,
    effectivePremium: false,
    unlockSource: null,
    source: null,
    expiresAt: null,
    planId: "discovery",
    appMode,
    billingEnabled: feats.billing,
    freemiumLimits: unlocked ? false : feats.freemiumLimits,
    trialEndsAt: null,
    recoveryOfferEligible: false,
  };

  if (!profile.premium && !isPaidPlan(planId)) {
    if (unlocked) {
      return {
        ...base,
        effectivePremium: true,
        unlockSource: profile.isBetaTester ? "beta" : "app_mode",
        planId,
        recoveryOfferEligible: false,
      };
    }
    return { ...base, planId: "discovery", recoveryOfferEligible: false };
  }

  if (profile.premiumUntil) {
    const expires = new Date(profile.premiumUntil);
    if (expires.getTime() < Date.now()) {
      if (unlocked) {
        return {
          ...base,
          source: profile.premiumSource ?? null,
          expiresAt: profile.premiumUntil,
          effectivePremium: true,
          unlockSource: profile.isBetaTester ? "beta" : "app_mode",
          planId,
          trialEndsAt: profile.premiumUntil ?? null,
          recoveryOfferEligible: false,
        };
      }
      return {
        ...base,
        source: profile.premiumSource ?? null,
        expiresAt: profile.premiumUntil,
        planId: "discovery",
        trialEndsAt: profile.premiumUntil ?? null,
        recoveryOfferEligible: true,
      };
    }
  }

  const paid = isPaidPlan(planId) || profile.premium;
  return {
    ...base,
    isPremium: paid,
    effectivePremium: paid || unlocked,
    unlockSource: paid
      ? (profile.premiumSource ?? "manual")
      : unlocked
        ? profile.isBetaTester
          ? "beta"
          : "app_mode"
        : null,
    source: profile.premiumSource ?? "manual",
    expiresAt: profile.premiumUntil ?? null,
    planId: isPaidPlan(planId) ? planId : profile.premium ? "pro" : "discovery",
    trialEndsAt: profile.premiumSource === "trial" ? profile.premiumUntil ?? null : null,
    recoveryOfferEligible: false,
  };
}

/** Compat legacy + abonnement. Sync = env trusted (pas de cookie spoof). */
export function resolvePremiumStatus(
  profile: Pick<
    UserProfile,
    "premium" | "premiumUntil" | "premiumSource" | "planId" | "isBetaTester"
  >,
): PremiumStatus {
  return resolveWithFeatures(
    profile,
    getBillingFeatures(),
    getTrustedAppMode(),
  );
}

export function isUserPremium(
  profile: Pick<
    UserProfile,
    "premium" | "premiumUntil" | "premiumSource" | "planId" | "isBetaTester"
  >,
): boolean {
  return resolvePremiumStatus(profile).effectivePremium;
}

export async function resolvePremiumStatusForUser(
  userId: string,
): Promise<PremiumStatus> {
  const feats = await getBillingFeaturesAsync();
  const appMode = getTrustedAppMode();
  const sub = await getCurrentSubscription(userId);
  const betaTester = await isBetaTester(userId);
  const paid = isPaidPlan(sub.planId);
  const unlocked = feats.allPremiumUnlocked || betaTester;
  const source: PremiumSource | null = paid
    ? sub.provider === "stripe" || sub.provider === "app_store"
      ? "stripe"
      : "trial"
    : null;

  return {
    isPremium: paid,
    effectivePremium: paid || unlocked,
    unlockSource: paid
      ? source
      : unlocked
        ? betaTester
          ? "beta"
          : "app_mode"
        : null,
    source,
    expiresAt: sub.currentPeriodEnd,
    planId: sub.planId,
    appMode,
    billingEnabled: feats.billing,
    freemiumLimits: unlocked ? false : feats.freemiumLimits,
    trialEndsAt: null,
    recoveryOfferEligible: false,
  };
}
