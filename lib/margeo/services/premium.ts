import type { UserProfile } from "../types";

export type PremiumSource = "manual" | "beta" | "stripe" | "trial";

export interface PremiumStatus {
  isPremium: boolean;
  source: PremiumSource | null;
  expiresAt: string | null;
}

/** Source unique de vérité Premium (sans Stripe pour l'instant). */
export function resolvePremiumStatus(
  profile: Pick<UserProfile, "premium" | "premiumUntil" | "premiumSource">,
): PremiumStatus {
  if (!profile.premium) {
    return { isPremium: false, source: null, expiresAt: null };
  }

  if (profile.premiumUntil) {
    const expires = new Date(profile.premiumUntil);
    if (expires.getTime() < Date.now()) {
      return {
        isPremium: false,
        source: profile.premiumSource ?? null,
        expiresAt: profile.premiumUntil,
      };
    }
  }

  return {
    isPremium: true,
    source: profile.premiumSource ?? "manual",
    expiresAt: profile.premiumUntil ?? null,
  };
}

export function isUserPremium(
  profile: Pick<UserProfile, "premium" | "premiumUntil" | "premiumSource">,
): boolean {
  return resolvePremiumStatus(profile).isPremium;
}
