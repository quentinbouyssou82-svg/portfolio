/** Identité produit Driveely — alignée app iOS. */
export const PRODUCT_NAME = "Driveely";
export const PRODUCT_TAGLINE = "Le comptable intelligent du livreur.";
export const PRODUCT_DESCRIPTION =
  "Vous livrez. Driveely analyse. Estimez ce que vous gagnez vraiment après vos coûts, et obtenez un verdict clair sur chaque course.";

/** Contact support / demandes RGPD. */
export const DRIVEELY_CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_DRIVEELY_CONTACT_EMAIL?.trim() ||
  "contactdriveelyai@gmail.com";

/** @deprecated Alias transition */
export const UBERLY_CONTACT_EMAIL = DRIVEELY_CONTACT_EMAIL;

export {
  DRIVEELY_APP_STORE_URL,
  DRIVEELY_PLAY_STORE_URL,
} from "./store-links";

export const PREMIUM_MONTHLY_EUR = "12,99";
export const PREMIUM_ANNUAL_EUR = "99,99";
export const PREMIUM_TRIAL_DAYS = 14;
export const FREE_DAILY_ANALYSES = 2;
