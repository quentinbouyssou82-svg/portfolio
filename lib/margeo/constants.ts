import { DRIVEELY_BASE, driveelyRoutes } from "./routes";

export const DRIVEELY_PREFIX = DRIVEELY_BASE;
export const MARGEO_PREFIX = DRIVEELY_BASE;

export const DRIVEELY_PATHS = {
  home: driveelyRoutes.home,
  login: driveelyRoutes.login,
  signup: driveelyRoutes.signup,
  onboarding: driveelyRoutes.onboarding,
  forgotPassword: driveelyRoutes.forgotPassword,
  deconnexion: driveelyRoutes.deconnexion,
  dashboard: driveelyRoutes.dashboard,
  analyse: driveelyRoutes.analyse,
  historique: driveelyRoutes.historique,
  profil: driveelyRoutes.profil,
  premium: driveelyRoutes.premium,
  subscription: driveelyRoutes.subscription,
  subscriptionCheckout: driveelyRoutes.subscriptionCheckout,
  mentionsLegales: driveelyRoutes.mentionsLegales,
  confidentialite: driveelyRoutes.confidentialite,
  cgu: driveelyRoutes.cgu,
  cgv: driveelyRoutes.cgv,
  cookies: driveelyRoutes.cookies,
  conditionsBeta: driveelyRoutes.conditionsBeta,
  beta: driveelyRoutes.beta,
  retour: driveelyRoutes.retour,
  questionnaire: driveelyRoutes.questionnaire,
  remboursement: driveelyRoutes.remboursement,
  demandesRgpd: driveelyRoutes.demandesRgpd,
  suppressionDonnees: driveelyRoutes.suppressionDonnees,
  securiteDonnees: driveelyRoutes.securiteDonnees,
  abonnementsStripe: driveelyRoutes.abonnementsStripe,
  proprieteIntellectuelle: driveelyRoutes.proprieteIntellectuelle,
  charteUtilisation: driveelyRoutes.charteUtilisation,
  contact: driveelyRoutes.contact,
} as const;

export const MARGEO_PATHS = DRIVEELY_PATHS;

export const PUBLIC_DRIVEELY_PATHS = new Set<string>([
  DRIVEELY_PATHS.home,
  DRIVEELY_PATHS.login,
  driveelyRoutes.login.replace(/\/login$/, "/signup"),
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
  "/retour",
  "/questionnaire",
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
