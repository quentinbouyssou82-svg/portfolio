export const UBERLY_BASE = "/demos/uberly";

/** @deprecated Utiliser UBERLY_BASE */
export const MARGEO_BASE = UBERLY_BASE;

export const uberlyRoutes = {
  home: UBERLY_BASE,
  login: `${UBERLY_BASE}/login`,
  signup: `${UBERLY_BASE}/login?mode=signup`,
  onboarding: `${UBERLY_BASE}/onboarding`,
  forgotPassword: `${UBERLY_BASE}/forgot-password`,
  deconnexion: `${UBERLY_BASE}/deconnexion`,
  dashboard: `${UBERLY_BASE}/dashboard`,
  analyse: `${UBERLY_BASE}/analyse`,
  historique: `${UBERLY_BASE}/historique`,
  historiqueDetail: (id: string) => `${UBERLY_BASE}/historique/${id}`,
  profil: `${UBERLY_BASE}/profil`,
  premium: `${UBERLY_BASE}/premium`,
  subscription: `${UBERLY_BASE}/subscription`,
  subscriptionCheckout: `${UBERLY_BASE}/subscription/checkout`,
  /** Pages juridiques — contenu à rédiger séparément. */
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

/** Alias rétrocompatibilité */
export const margeoRoutes = uberlyRoutes;
