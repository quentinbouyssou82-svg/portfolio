/**
 * Feature flags dérivés du mode app.
 * Toute logique commerciale / freemium doit lire ces flags — jamais APP_MODE en dur.
 */

import { getAppMode, type DriveelyAppMode } from "./environment";

export type PremiumPageMode = "commercial" | "beta_unlocked";

export type DriveelyFeatures = {
  mode: DriveelyAppMode;
  /** Afficher / forcer le parcours paywall commercial */
  paywall: boolean;
  /** Soft banner dashboard free → premium */
  paywallSoftBanner: boolean;
  /** Limites freemium (2 analyses/jour, historique court) */
  freemiumLimits: boolean;
  /** Checkout / activation d'abonnement */
  billing: boolean;
  /** Stripe Checkout (sinon simulated si billing actif) */
  stripe: boolean;
  /** Essais 14 j / messaging trial */
  trials: boolean;
  /** Toutes les capacités Elite pour tout le monde */
  allPremiumUnlocked: boolean;
  /** Page /premium : commercial flow ou message bêta */
  premiumPageMode: PremiumPageMode;
  /** Après onboarding : envoyer vers paywall (sinon dashboard) */
  postOnboardingPaywall: boolean;
  /**
   * Feedback bêta — routes/actions préparées.
   * UI complète à brancher plus tard ; flags prêts.
   */
  feedback: {
    enabled: boolean;
    bugs: boolean;
    ideas: boolean;
    issues: boolean;
  };
};

const PRODUCTION_FEATURES: DriveelyFeatures = {
  mode: "production",
  paywall: true,
  paywallSoftBanner: true,
  freemiumLimits: true,
  billing: true,
  stripe: true,
  trials: true,
  allPremiumUnlocked: false,
  premiumPageMode: "commercial",
  postOnboardingPaywall: true,
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
  trials: false,
  allPremiumUnlocked: true,
  premiumPageMode: "beta_unlocked",
  postOnboardingPaywall: false,
  feedback: {
    enabled: true,
    bugs: true,
    ideas: true,
    issues: true,
  },
};

export function getAppFeatures(mode = getAppMode()): DriveelyFeatures {
  return mode === "beta" ? BETA_FEATURES : PRODUCTION_FEATURES;
}

/** Raccourcis typés — préférer getAppFeatures() pour plusieurs flags. */
export const features = {
  get: getAppFeatures,
  paywall: () => getAppFeatures().paywall,
  billing: () => getAppFeatures().billing,
  freemiumLimits: () => getAppFeatures().freemiumLimits,
  allPremiumUnlocked: () => getAppFeatures().allPremiumUnlocked,
};
