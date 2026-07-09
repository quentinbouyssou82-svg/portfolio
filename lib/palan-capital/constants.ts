export const PALAN_BASE = "/demos/palan-capital";

export const PALAN_COLORS = {
  navy: "#0B1426",
  navyLight: "#121F38",
  gold: "#C9A84C",
  goldLight: "#D4B96A",
  ivory: "#F5F0E8",
  white: "#FFFFFF",
  gray: "#6B7280",
  grayLight: "#9CA3AF",
} as const;

export const PUBLIC_CONTACT_EMAIL = "contact@palancapital.com";
export const CONTACT_EMAIL = process.env.PALAN_CONTACT_EMAIL ?? "julien@sas-living.com";
export const FROM_EMAIL = process.env.PALAN_FROM_EMAIL ?? PUBLIC_CONTACT_EMAIL;

/** Hero law-shelf — identical treatment to Apex `?hero=law-shelf` */
export const PALAN_HERO_IMAGE = {
  src: "https://images.unsplash.com/photo-1752697589000-9819ed4fc30c?auto=format&fit=crop&w=2400&q=92",
  objectPosition: "72% 40%",
} as const;

export const PALAN_MARQUEE = [
  "France",
  "Luxembourg",
  "Émirats Arabes Unis",
  "Dette privée",
  "Structuration patrimoniale",
  "Levée de fonds",
  "Dirigeants",
  "Patrimoines privés",
  "Fonds",
  "Investisseurs qualifiés",
] as const;

export const NAV_LINKS = [
  { href: `${PALAN_BASE}/dirigeants`, label: "Dirigeants" },
  { href: `${PALAN_BASE}/patrimoines-prives`, label: "Patrimoines privés" },
  { href: `${PALAN_BASE}/fonds`, label: "Fonds" },
  { href: `${PALAN_BASE}/investisseurs`, label: "Investisseurs" },
  { href: `${PALAN_BASE}/cabinet`, label: "Cabinet" },
] as const;

export const CONTACT_SUBJECTS = [
  "Demander un entretien",
  "Dirigeants & cédants",
  "Patrimoines privés",
  "Fonds d'investissement",
  "Investisseurs qualifiés",
  "Autre",
] as const;

export const AUTO_REPLY_BODY = `Bonjour,

Nous avons bien reçu votre demande. Palan Capital vous recontactera dans les meilleurs délais pour un entretien de cadrage confidentiel, sans engagement.

Cordialement,
Palan Capital — SAS LIVING
2 rue d'Austerlitz · 31000 Toulouse`;
