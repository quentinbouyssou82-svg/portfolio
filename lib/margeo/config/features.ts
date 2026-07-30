/**
 * Feature flags dérivés du mode app.
 * Toute logique commerciale / freemium doit lire ces flags — jamais APP_MODE en dur.
 */

import { getAppMode, getAppModeAsync, type DriveelyAppMode } from "./environment";

export type PremiumPageMode = "commercial" | "beta_unlocked" | "coming_soon";

export type DriveelyFeatures = {
  mode: DriveelyAppMode;
  /** Afficher / forcer le parcours paywall commercial */
  paywall: boolean;
  /** Soft banner dashboard free → premium */
  paywallSoftBanner: boolean;
  /** Limites freemium (2 analyses/jour, historique court) */
  freemiumLimits: boolean;
  /** Surfaces billing / checkout présentes dans le code */
  billing: boolean;
  /** Tentative Stripe Checkout (quand clé + purchasesEnabled) */
  stripe: boolean;
  /**
   * Autorise un achat réel.
   * false = code Stripe conservé, CTA → « Ouverture prochaine ».
   */
  purchasesEnabled: boolean;
  /** Essais 14 j / messaging trial */
  trials: boolean;
  /** Toutes les capacités Elite pour tout le monde */
  allPremiumUnlocked: boolean;
  /** Page /premium */
  premiumPageMode: PremiumPageMode;
  /** Après onboarding : envoyer vers paywall (sinon dashboard) */
  postOnboardingPaywall: boolean;
  /** Badge UI « Bêta » */
  showBetaBadge: boolean;
  /** Message d’ouverture officielle */
  officialComingSoon: boolean;
  feedback: {
    enabled: boolean;
    bugs: boolean;
    ideas: boolean;
    issues: boolean;
  };
};

function purchasesFlagFromEnv(): boolean {
  return (
    process.env.DRIVEELY_PURCHASES_ENABLED === "true" ||
    process.env.NEXT_PUBLIC_DRIVEELY_PURCHASES_ENABLED === "true"
  );
}

const PRODUCTION_FEATURES: DriveelyFeatures = {
  mode: "production",
  paywall: true,
  paywallSoftBanner: true,
  freemiumLimits: true,
  billing: true,
  stripe: true,
  purchasesEnabled: purchasesFlagFromEnv(),
  trials: true,
  allPremiumUnlocked: false,
  premiumPageMode: purchasesFlagFromEnv() ? "commercial" : "coming_soon",
  postOnboardingPaywall: true,
  showBetaBadge: false,
  officialComingSoon: !purchasesFlagFromEnv(),
  feedback: {
    enabled: false,
    bugs: false,
    ideas: false,
    issues: false,
  },
};

const BETA_FEATURES: DriveelyFeatures = {
  mode: "beta",
  paywall: false,
  paywallSoftBanner: false,
  freemiumLimits: false,
  billing: false,
  stripe: false,
  purchasesEnabled: false,
  trials: false,
  allPremiumUnlocked: true,
  premiumPageMode: "beta_unlocked",
  postOnboardingPaywall: false,
  showBetaBadge: true,
  officialComingSoon: false,
  feedback: {
    enabled: true,
    bugs: true,
    ideas: true,
    issues: true,
  },
};

export function getAppFeatures(mode = getAppMode()): DriveelyFeatures {
  if (mode === "beta") return BETA_FEATURES;
  // Re-evaluate purchases flag (env can change between builds)
  return {
    ...PRODUCTION_FEATURES,
    purchasesEnabled: purchasesFlagFromEnv(),
    premiumPageMode: purchasesFlagFromEnv() ? "commercial" : "coming_soon",
    officialComingSoon: !purchasesFlagFromEnv(),
  };
}

export async function getAppFeaturesAsync(): Promise<DriveelyFeatures> {
  return getAppFeatures(await getAppModeAsync());
}

/** Raccourcis typés — préférer getAppFeatures() pour plusieurs flags. */
export const features = {
  get: getAppFeatures,
  paywall: () => getAppFeatures().paywall,
  billing: () => getAppFeatures().billing,
  freemiumLimits: () => getAppFeatures().freemiumLimits,
  allPremiumUnlocked: () => getAppFeatures().allPremiumUnlocked,
  purchasesEnabled: () => getAppFeatures().purchasesEnabled,
};
