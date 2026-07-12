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
} as const;

export const MARGEO_PATHS = UBERLY_PATHS;

export const PUBLIC_UBERLY_PATHS = new Set<string>([
  UBERLY_PATHS.home,
  UBERLY_PATHS.login,
  `${UBERLY_BASE}/signup`,
  UBERLY_PATHS.forgotPassword,
  UBERLY_PATHS.deconnexion,
]);

export const PUBLIC_MARGEO_PATHS = PUBLIC_UBERLY_PATHS;

export const PROTECTED_UBERLY_PREFIXES = [
  "/dashboard",
  "/analyse",
  "/historique",
  "/profil",
  "/premium",
] as const;

export const PROTECTED_MARGEO_PREFIXES = PROTECTED_UBERLY_PREFIXES;

export const DEFAULT_VEHICLE_COSTS = {
  velo: 0.05,
  velo_electrique: 0.08,
  scooter: 0.24,
  moto: 0.22,
  voiture: 0.35,
} as const;

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
