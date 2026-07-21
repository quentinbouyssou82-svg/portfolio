/** Identité produit Uberly (ex-Margeo). */
export const PRODUCT_NAME = "Uberly";
export const PRODUCT_TAGLINE =
  "Sais si une course vaut le coup — avant d'accepter.";
export const PRODUCT_DESCRIPTION =
  "Capture ta proposition. Uberly calcule ton gain net et te dit quoi faire en 8 secondes.";

/** Contact support / demandes RGPD (surchargeable via env). */
export const UBERLY_CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_UBERLY_CONTACT_EMAIL?.trim() || "contact@uberly.app";
