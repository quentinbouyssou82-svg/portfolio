export const PALAN_BASE = "/demos/palan-capital";

export const PALAN_COLORS = {
  navy: "#0B1426",
  gold: "#C9A84C",
  ivory: "#F5F0E8",
  white: "#FFFFFF",
  gray: "#6B7280",
} as const;

export const NAV_LINKS = [
  { href: `${PALAN_BASE}/dirigeants`, label: "Dirigeants" },
  { href: `${PALAN_BASE}/patrimoines-prives`, label: "Patrimoines privés" },
  { href: `${PALAN_BASE}/fonds`, label: "Fonds" },
  { href: `${PALAN_BASE}/investisseurs`, label: "Investisseurs" },
  { href: `${PALAN_BASE}/cabinet`, label: "Cabinet" },
] as const;

export const CONTACT_EMAIL = "contact@palancapital.com";

export const CONTACT_SUBJECTS = [
  "Structuration de financement",
  "Cession ou transmission",
  "Patrimoine privé international",
  "Fonds d'investissement",
  "Opportunité d'investissement",
  "Autre",
] as const;
