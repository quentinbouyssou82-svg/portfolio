import { DRIVEELY_BASE } from "./routes";

export const DRIVEELY_PREFIX = DRIVEELY_BASE;
export const MARGEO_PREFIX = DRIVEELY_BASE;

export const DRIVEELY_PATHS = {
  home: DRIVEELY_BASE,
  login: `${DRIVEELY_BASE}/login`,
  signup: `${DRIVEELY_BASE}/login?mode=signup`,
  onboarding: `${DRIVEELY_BASE}/onboarding`,
  forgotPassword: `${DRIVEELY_BASE}/forgot-password`,
  deconnexion: `${DRIVEELY_BASE}/deconnexion`,
  dashboard: `${DRIVEELY_BASE}/dashboard`,
  analyse: `${DRIVEELY_BASE}/analyse`,
  historique: `${DRIVEELY_BASE}/historique`,
  profil: `${DRIVEELY_BASE}/profil`,
  premium: `${DRIVEELY_BASE}/premium`,
  subscription: `${DRIVEELY_BASE}/subscription`,
  subscriptionCheckout: `${DRIVEELY_BASE}/subscription/checkout`,
  mentionsLegales: `${DRIVEELY_BASE}/mentions-legales`,
  confidentialite: `${DRIVEELY_BASE}/confidentialite`,
  cgu: `${DRIVEELY_BASE}/cgu`,
  cgv: `${DRIVEELY_BASE}/cgv`,
  cookies: `${DRIVEELY_BASE}/cookies`,
  conditionsBeta: `${DRIVEELY_BASE}/conditions-beta`,
  beta: `${DRIVEELY_BASE}/beta`,
  remboursement: `${DRIVEELY_BASE}/remboursement`,
  demandesRgpd: `${DRIVEELY_BASE}/demandes-rgpd`,
  suppressionDonnees: `${DRIVEELY_BASE}/suppression-donnees`,
  securiteDonnees: `${DRIVEELY_BASE}/securite-donnees`,
  abonnementsStripe: `${DRIVEELY_BASE}/abonnements-stripe`,
  proprieteIntellectuelle: `${DRIVEELY_BASE}/propriete-intellectuelle`,
  charteUtilisation: `${DRIVEELY_BASE}/charte-utilisation`,
  contact: `${DRIVEELY_BASE}/contact`,
} as const;

export const MARGEO_PATHS = DRIVEELY_PATHS;

export const PUBLIC_DRIVEELY_PATHS = new Set<string>([
  DRIVEELY_PATHS.home,
  DRIVEELY_PATHS.login,
  `${DRIVEELY_BASE}/signup`,
  DRIVEELY_PATHS.forgotPassword,
  DRIVEELY_PATHS.deconnexion,
  DRIVEELY_PATHS.mentionsLegales,
  DRIVEELY_PATHS.confidentialite,
  DRIVEELY_PATHS.cgu,
  DRIVEELY_PATHS.cgv,
  DRIVEELY_PATHS.cookies,
  DRIVEELY_PATHS.conditionsBeta,
  DRIVEELY_PATHS.beta,
  DRIVEELY_PATHS.remboursement,
  DRIVEELY_PATHS.demandesRgpd,
  DRIVEELY_PATHS.suppressionDonnees,
  DRIVEELY_PATHS.securiteDonnees,
  DRIVEELY_PATHS.abonnementsStripe,
  DRIVEELY_PATHS.proprieteIntellectuelle,
  DRIVEELY_PATHS.charteUtilisation,
  DRIVEELY_PATHS.contact,
]);

export const PUBLIC_MARGEO_PATHS = PUBLIC_DRIVEELY_PATHS;

export const PROTECTED_DRIVEELY_PREFIXES = [
  "/dashboard",
  "/analyse",
  "/historique",
  "/profil",
  "/premium",
  "/subscription",
] as const;

export const PROTECTED_MARGEO_PREFIXES = PROTECTED_DRIVEELY_PREFIXES;

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
