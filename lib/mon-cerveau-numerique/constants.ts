export const MCN_BASE = "/demos/mon-cerveau-numerique";

export const MCN_PATHS = {
  home: MCN_BASE,
  login: `${MCN_BASE}/login`,
  onboarding: `${MCN_BASE}/onboarding`,
  dashboard: `${MCN_BASE}/dashboard`,
  documents: `${MCN_BASE}/dashboard/documents`,
  todos: `${MCN_BASE}/dashboard/todos`,
  recap: `${MCN_BASE}/dashboard/recap`,
  settings: `${MCN_BASE}/dashboard/settings`,
  legal: {
    cgu: `${MCN_BASE}/legal/cgu`,
    confidentialite: `${MCN_BASE}/legal/confidentialite`,
    dpa: `${MCN_BASE}/legal/dpa`,
  },
} as const;

export const MCN_AUTH_COOKIE_PREFIX = "mcn-auth";
