import {
  getDriveelyPublicBase,
  isDriveelyAtRoot,
} from "@/lib/margeo/host";

/**
 * Base URL publique Driveely.
 * - Produit (driveely.app) : "" → /login, /dashboard…
 * - Démo monorepo : "/demos/driveely"
 */
export const DRIVEELY_BASE = getDriveelyPublicBase();

/** @deprecated Utiliser DRIVEELY_BASE */
export const MARGEO_BASE = DRIVEELY_BASE;

function path(segment: string): string {
  if (!segment) {
    return DRIVEELY_BASE || "/";
  }
  return `${DRIVEELY_BASE}/${segment}`.replace(/\/{2,}/g, "/");
}

export const driveelyRoutes = {
  home: path(""),
  login: path("login"),
  signup: `${path("login")}?mode=signup`,
  onboarding: path("onboarding"),
  howItWorks: path("comment-ca-marche"),
  forgotPassword: path("forgot-password"),
  deconnexion: path("deconnexion"),
  dashboard: path("dashboard"),
  analyse: path("analyse"),
  historique: path("historique"),
  historiqueDetail: (id: string) => path(`historique/${id}`),
  profil: path("profil"),
  premium: path("premium"),
  subscription: path("subscription"),
  subscriptionCheckout: path("subscription/checkout"),
  mentionsLegales: path("mentions-legales"),
  confidentialite: path("confidentialite"),
  cgu: path("cgu"),
  cgv: path("cgv"),
  cookies: path("cookies"),
  conditionsBeta: path("conditions-beta"),
  beta: path("beta"),
  retour: path("retour"),
  questionnaire: path("questionnaire"),
  remboursement: path("remboursement"),
  demandesRgpd: path("demandes-rgpd"),
  suppressionDonnees: path("suppression-donnees"),
  securiteDonnees: path("securite-donnees"),
  abonnementsStripe: path("abonnements-stripe"),
  proprieteIntellectuelle: path("propriete-intellectuelle"),
  charteUtilisation: path("charte-utilisation"),
  contact: path("contact"),
} as const;

/** Alias rétrocompatibilité */
export const margeoRoutes = driveelyRoutes;

export { isDriveelyAtRoot };
