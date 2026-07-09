export type GroceryProviderId = "leclerc_drive" | "netto" | "other";

export interface GroceryProviderConfig {
  id: GroceryProviderId;
  label: string;
  shortLabel: string;
  description: string;
  logoPath: string;
  brandColor: string;
  logoBg: string;
  gradientFrom: string;
  gradientTo: string;
  supportsMock: boolean;
  supportsManual: boolean;
  supportsOAuthRedirect: boolean;
  defaultStoreId: string;
}

export const GROCERY_PROVIDERS: Record<GroceryProviderId, GroceryProviderConfig> = {
  leclerc_drive: {
    id: "leclerc_drive",
    label: "e.Leclerc Drive",
    shortLabel: "Leclerc",
    description: "Drive et retrait — export de liste compatible",
    logoPath: "/maison/providers/leclerc.svg",
    brandColor: "#0066CC",
    logoBg: "#e8f2fc",
    gradientFrom: "from-[#0066CC]",
    gradientTo: "to-[#0052a3]",
    supportsMock: true,
    supportsManual: true,
    supportsOAuthRedirect: true,
    defaultStoreId: "LECLERC-DRIVE-DEMO",
  },
  netto: {
    id: "netto",
    label: "Netto Drive",
    shortLabel: "Netto",
    description: "Enseigne discount — connexion en préparation",
    logoPath: "/maison/providers/netto.svg",
    brandColor: "#E30613",
    logoBg: "#fff8e6",
    gradientFrom: "from-[#E30613]",
    gradientTo: "to-[#c20510]",
    supportsMock: true,
    supportsManual: true,
    supportsOAuthRedirect: false,
    defaultStoreId: "NETTO-DRIVE-DEMO",
  },
  other: {
    id: "other",
    label: "Autre enseigne",
    shortLabel: "Autre",
    description: "Mode manuel sans synchronisation automatique",
    logoPath: "/maison/providers/other.svg",
    brandColor: "#6b8f71",
    logoBg: "#f4f3f0",
    gradientFrom: "from-stone-600",
    gradientTo: "to-stone-700",
    supportsMock: false,
    supportsManual: true,
    supportsOAuthRedirect: false,
    defaultStoreId: "OTHER-DEMO",
  },
};

export const GROCERY_PROVIDER_LIST = Object.values(GROCERY_PROVIDERS);

const MOCK_STORES: Record<GroceryProviderId, Array<{ id: string; label: string }>> = {
  leclerc_drive: [
    { id: "LECLERC-DRIVE-PARIS-15", label: "Leclerc Drive — Paris 15e" },
    { id: "LECLERC-DRIVE-LYON-3", label: "Leclerc Drive — Lyon 3e" },
    { id: "LECLERC-DRIVE-DEMO", label: "Leclerc Drive — Démo" },
  ],
  netto: [
    { id: "NETTO-DRIVE-NANTES", label: "Netto Drive — Nantes" },
    { id: "NETTO-DRIVE-RENNES", label: "Netto Drive — Rennes" },
    { id: "NETTO-DRIVE-DEMO", label: "Netto Drive — Démo" },
  ],
  other: [{ id: "OTHER-DEMO", label: "Enseigne — Démo" }],
};

export function getProviderStores(provider: GroceryProviderId): Array<{ id: string; label: string }> {
  return MOCK_STORES[provider];
}
