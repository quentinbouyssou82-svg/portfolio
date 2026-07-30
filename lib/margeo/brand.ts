/** Identité produit Driveely (ex-Uberly / Margeo). */
export const PRODUCT_NAME = "Driveely";
export const PRODUCT_TAGLINE =
  "Estime si une course vaut le coup — avant d'accepter.";
export const PRODUCT_DESCRIPTION =
  "Estime le gain net d'une course Uber Eats, Deliveroo ou Stuart avant d'accepter — coût au km, retour à vide, €/h. Pour livreurs indépendants.";

/** Contact support / demandes RGPD (surchargeable via env). */
export const DRIVEELY_CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_DRIVEELY_CONTACT_EMAIL?.trim() ||
  process.env.NEXT_PUBLIC_UBERLY_CONTACT_EMAIL?.trim() ||
  "contact@driveely.app";

/** @deprecated Alias transition Uberly → Driveely */
export const UBERLY_CONTACT_EMAIL = DRIVEELY_CONTACT_EMAIL;
