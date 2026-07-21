import { UBERLY_BASE } from "./routes";

export const UBERLY_PREFIX = UBERLY_BASE;
export const MARGEO_PREFIX = UBERLY_BASE;

export const UBERLY_PATHS = {
  home: UBERLY_BASE,
  login: `${UBERLY_BASE}/login`,
  signup: `${UBERLY_BASE}/login?mode=signup`,
  onboarding: `${UBERLY_BASE}/onboarding`,
  forgotPassword: `${UBERLY_BASE}/forgot-password`,
  deconnexion: `${UBERLY_BASE}/deconnexion`,
  dashboard: `${UBERLY_BASE}/dashboard`,
  analyse: `${UBERLY_BASE}/analyse`,
  historique: `${UBERLY_BASE}/historique`,
  profil: `${UBERLY_BASE}/profil`,
  premium: `${UBERLY_BASE}/premium`,
  subscription: `${UBERLY_BASE}/subscription`,
  subscriptionCheckout: `${UBERLY_BASE}/subscription/checkout`,
  mentionsLegales: `${UBERLY_BASE}/mentions-legales`,
  confidentialite: `${UBERLY_BASE}/confidentialite`,
  cgu: `${UBERLY_BASE}/cgu`,
  cgv: `${UBERLY_BASE}/cgv`,
  cookies: `${UBERLY_BASE}/cookies`,
  conditionsBeta: `${UBERLY_BASE}/conditions-beta`,
  beta: `${UBERLY_BASE}/beta`,
  remboursement: `${UBERLY_BASE}/remboursement`,
  demandesRgpd: `${UBERLY_BASE}/demandes-rgpd`,
  suppressionDonnees: `${UBERLY_BASE}/suppression-donnees`,
  securiteDonnees: `${UBERLY_BASE}/securite-donnees`,
  abonnementsStripe: `${UBERLY_BASE}/abonnements-stripe`,
  proprieteIntellectuelle: `${UBERLY_BASE}/propriete-intellectuelle`,
  charteUtilisation: `${UBERLY_BASE}/charte-utilisation`,
  contact: `${UBERLY_BASE}/contact`,
} as const;

export const MARGEO_PATHS = UBERLY_PATHS;

export const PUBLIC_UBERLY_PATHS = new Set<string>([
  UBERLY_PATHS.home,
  UBERLY_PATHS.login,
  `${UBERLY_BASE}/signup`,
  UBERLY_PATHS.forgotPassword,
  UBERLY_PATHS.deconnexion,
  UBERLY_PATHS.mentionsLegales,
  UBERLY_PATHS.confidentialite,
  UBERLY_PATHS.cgu,
  UBERLY_PATHS.cgv,
  UBERLY_PATHS.cookies,
  UBERLY_PATHS.conditionsBeta,
  UBERLY_PATHS.beta,
  UBERLY_PATHS.remboursement,
  UBERLY_PATHS.demandesRgpd,
  UBERLY_PATHS.suppressionDonnees,
  UBERLY_PATHS.securiteDonnees,
  UBERLY_PATHS.abonnementsStripe,
  UBERLY_PATHS.proprieteIntellectuelle,
  UBERLY_PATHS.charteUtilisation,
  UBERLY_PATHS.contact,
]);

export const PUBLIC_MARGEO_PATHS = PUBLIC_UBERLY_PATHS;

export const PROTECTED_UBERLY_PREFIXES = [
  "/dashboard",
  "/analyse",
  "/historique",
  "/profil",
  "/premium",
  "/subscription",
] as const;

export const PROTECTED_MARGEO_PREFIXES = PROTECTED_UBERLY_PREFIXES;

export { DEFAULT_VEHICLE_COSTS } from "./vehicle-costs";

export const ONBOARDING_PLATFORMS = [
  "Uber Eats",
  "Deliveroo",
  "Stuart",
  "Amazon Flex",
] as const;

export const ALL_PLATFORMS = [
  ...ONBOARDING_PLATFORMS,
  "Autre",
] as const;
