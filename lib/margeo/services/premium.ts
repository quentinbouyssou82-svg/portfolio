import type { UserProfile } from "../types";
import { isPaidPlan } from "@/lib/margeo/billing/entitlements";
import { getCurrentSubscription } from "@/lib/margeo/services/subscription";

export type PremiumSource = "manual" | "beta" | "stripe" | "trial";

export interface PremiumStatus {
  isPremium: boolean;
  source: PremiumSource | null;
  expiresAt: string | null;
  planId: "discovery" | "pro" | "elite";
}

/** Compat legacy + abonnement. */
export function resolvePremiumStatus(
  profile: Pick<UserProfile, "premium" | "premiumUntil" | "premiumSource" | "planId">,
): PremiumStatus {
  const planId =
    profile.planId ?? (profile.premium ? "pro" : "discovery");

  if (!profile.premium && !isPaidPlan(planId)) {
    return { isPremium: false, source: null, expiresAt: null, planId: "discovery" };
  }

  if (profile.premiumUntil) {
    const expires = new Date(profile.premiumUntil);
    if (expires.getTime() < Date.now()) {
      return {
        isPremium: false,
        source: profile.premiumSource ?? null,
        expiresAt: profile.premiumUntil,
        planId: "discovery",
      };
    }
  }

  return {
    isPremium: isPaidPlan(planId) || profile.premium,
    source: profile.premiumSource ?? "manual",
    expiresAt: profile.premiumUntil ?? null,
    planId: isPaidPlan(planId) ? planId : profile.premium ? "pro" : "discovery",
  };
}

export function isUserPremium(
  profile: Pick<UserProfile, "premium" | "premiumUntil" | "premiumSource" | "planId">,
): boolean {
  return resolvePremiumStatus(profile).isPremium;
}

export async function resolvePremiumStatusForUser(
  userId: string,
): Promise<PremiumStatus> {
  const sub = await getCurrentSubscription(userId);
  const paid = isPaidPlan(sub.planId);
  return {
    isPremium: paid,
    source:
      sub.provider === "stripe"
        ? "stripe"
        : paid
          ? "trial"
          : null,
    expiresAt: sub.currentPeriodEnd,
    planId: sub.planId,
  };
}
