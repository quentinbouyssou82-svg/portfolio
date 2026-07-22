export const DRIVEELY_BASE = "/demos/driveely";

/** @deprecated Utiliser DRIVEELY_BASE */
export const MARGEO_BASE = DRIVEELY_BASE;

export const driveelyRoutes = {
  home: DRIVEELY_BASE,
  login: `${DRIVEELY_BASE}/login`,
  signup: `${DRIVEELY_BASE}/login?mode=signup`,
  onboarding: `${DRIVEELY_BASE}/onboarding`,
  forgotPassword: `${DRIVEELY_BASE}/forgot-password`,
  deconnexion: `${DRIVEELY_BASE}/deconnexion`,
  dashboard: `${DRIVEELY_BASE}/dashboard`,
  analyse: `${DRIVEELY_BASE}/analyse`,
  historique: `${DRIVEELY_BASE}/historique`,
  historiqueDetail: (id: string) => `${DRIVEELY_BASE}/historique/${id}`,
  profil: `${DRIVEELY_BASE}/profil`,
  premium: `${DRIVEELY_BASE}/premium`,
  subscription: `${DRIVEELY_BASE}/subscription`,
  subscriptionCheckout: `${DRIVEELY_BASE}/subscription/checkout`,
  /** Pages juridiques — contenu à rédiger séparément. */
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

/** Alias rétrocompatibilité */
export const margeoRoutes = driveelyRoutes;
