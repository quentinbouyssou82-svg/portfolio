import type { GroceryIntegration } from "@/lib/maison/types";
import { getHousehold, updateHousehold } from "@/lib/maison/services/households";
import {
  GROCERY_PROVIDERS,
  getProviderStores,
  type GroceryProviderId,
} from "@/lib/maison/grocery-providers/config";

export type GroceryConnectMode = "mock" | "manual";

function readIntegrationFromSettings(
  settings: Record<string, unknown> | undefined,
): GroceryIntegration | null {
  if (!settings) return null;
  const fromNew = settings.grocery_provider as GroceryIntegration | undefined;
  if (fromNew) return fromNew;
  const fromLegacy = settings.leclerc as GroceryIntegration | undefined;
  return fromLegacy ?? null;
}

export async function getGroceryIntegration(
  householdId: string,
): Promise<GroceryIntegration | null> {
  const household = await getHousehold(householdId);
  if (!household) return null;
  return readIntegrationFromSettings(household.global_settings as Record<string, unknown>);
}

/** @deprecated Use getGroceryIntegration */
export const getLeclercIntegration = getGroceryIntegration;

export async function connectGroceryProvider(
  householdId: string,
  provider: GroceryProviderId,
  mode: GroceryConnectMode,
  storeId?: string,
): Promise<GroceryIntegration> {
  const config = GROCERY_PROVIDERS[provider];

  if (mode === "mock" && !config.supportsMock) {
    throw new Error(`Connexion simulée non disponible pour ${config.label}.`);
  }

  const integration: GroceryIntegration =
    mode === "mock"
      ? {
          provider,
          status: "connected_mock",
          storeId: storeId ?? config.defaultStoreId,
          connectedAt: new Date().toISOString(),
          accountLabel: `Compte démo ${config.label}`,
          oauthMode: "mock",
        }
      : {
          provider,
          status: "manual",
          connectedAt: new Date().toISOString(),
          accountLabel: `Mode manuel — ${config.shortLabel}`,
          oauthMode: "manual",
        };

  const household = await getHousehold(householdId);
  const prev = household?.global_settings ?? {};
  await updateHousehold(householdId, {
    global_settings: {
      ...prev,
      grocery_provider: integration,
    },
  });

  return integration;
}

/** @deprecated Use connectGroceryProvider */
export async function connectLeclerc(
  householdId: string,
  mode: GroceryConnectMode,
  storeId?: string,
): Promise<GroceryIntegration> {
  return connectGroceryProvider(householdId, "leclerc_drive", mode, storeId);
}

/** Future : OAuth e.Leclerc — délégué au module oauth */
export async function connectLeclercOAuth(
  householdId: string,
  memberId: string,
  storeId?: string,
): Promise<string> {
  const { buildGroceryOAuthAuthorizeUrl } = await import("@/lib/maison/grocery-providers/oauth");
  return buildGroceryOAuthAuthorizeUrl({
    householdId,
    memberId,
    provider: "leclerc_drive",
    storeId,
  });
}

/** Map ingredient → produit Leclerc (mock) */
export function mockLeclercProductId(ingredientName: string): string | null {
  const key = ingredientName.toLowerCase().trim();
  const map: Record<string, string> = {
    poulet: "LCL-POULET-001",
    riz: "LCL-RIZ-BASMATI",
    tomate: "LCL-TOMATE-GRAPPE",
    lait: "LCL-LAIT-UHT",
    pain: "LCL-PAIN-COMPLET",
  };
  for (const [term, id] of Object.entries(map)) {
    if (key.includes(term)) return id;
  }
  return null;
}

export async function listStores(
  provider: GroceryProviderId,
): Promise<Array<{ id: string; label: string }>> {
  return getProviderStores(provider);
}

/** @deprecated Use listStores("leclerc_drive") */
export async function listLeclercStores(): Promise<Array<{ id: string; label: string }>> {
  return listStores("leclerc_drive");
}

export function isGroceryProviderConnected(integration: GroceryIntegration | null): boolean {
  return (
    integration?.status === "connected_mock" ||
    integration?.status === "connected" ||
    integration?.status === "manual"
  );
}

/** @deprecated Use isGroceryProviderConnected */
export const isLeclercConnected = isGroceryProviderConnected;
