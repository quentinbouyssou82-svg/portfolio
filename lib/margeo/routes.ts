export const UBERLY_BASE = "/demos/uberly";

/** @deprecated Utiliser UBERLY_BASE */
export const MARGEO_BASE = UBERLY_BASE;

export const uberlyRoutes = {
  home: UBERLY_BASE,
  login: `${UBERLY_BASE}/login`,
  signup: `${UBERLY_BASE}/signup`,
  onboarding: `${UBERLY_BASE}/onboarding`,
  forgotPassword: `${UBERLY_BASE}/forgot-password`,
  authCallback: `${UBERLY_BASE}/auth/callback`,
  dashboard: `${UBERLY_BASE}/dashboard`,
  analyse: `${UBERLY_BASE}/analyse`,
  historique: `${UBERLY_BASE}/historique`,
  historiqueDetail: (id: string) => `${UBERLY_BASE}/historique/${id}`,
  profil: `${UBERLY_BASE}/profil`,
  premium: `${UBERLY_BASE}/premium`,
} as const;

/** Alias rétrocompatibilité */
export const margeoRoutes = uberlyRoutes;
