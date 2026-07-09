import { getPinSecret } from "@/lib/maison/env";
import type { GroceryProviderId } from "@/lib/maison/grocery-providers/config";
import { getHousehold, updateHousehold } from "@/lib/maison/services/households";

export interface GroceryProviderCredentials {
  provider: GroceryProviderId;
  accessTokenEnc?: string;
  refreshTokenEnc?: string;
  expiresAt?: string;
  tokenType?: string;
  scope?: string;
  externalAccountId?: string;
  updatedAt: string;
}

async function deriveAesKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const hash = await crypto.subtle.digest("SHA-256", enc.encode(`${getPinSecret()}:grocery-creds`));
  return crypto.subtle.importKey("raw", hash, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

async function encryptSecret(plain: string): Promise<string> {
  const key = await deriveAesKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(plain));
  const combined = new Uint8Array(iv.length + cipher.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(cipher), iv.length);
  return btoa(String.fromCharCode(...combined))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function decryptSecret(encValue: string): Promise<string | null> {
  try {
    const key = await deriveAesKey();
    const raw = atob(encValue.replace(/-/g, "+").replace(/_/g, "/"));
    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
    const iv = bytes.slice(0, 12);
    const data = bytes.slice(12);
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
    return new TextDecoder().decode(plain);
  } catch {
    return null;
  }
}

function readCredentials(settings: Record<string, unknown> | undefined): GroceryProviderCredentials | null {
  const creds = settings?.grocery_credentials as GroceryProviderCredentials | undefined;
  return creds ?? null;
}

export async function getGroceryCredentials(
  householdId: string,
): Promise<GroceryProviderCredentials | null> {
  const household = await getHousehold(householdId);
  if (!household) return null;
  return readCredentials(household.global_settings as Record<string, unknown>);
}

export async function saveGroceryCredentials(
  householdId: string,
  credentials: GroceryProviderCredentials,
): Promise<void> {
  const household = await getHousehold(householdId);
  const prev = household?.global_settings ?? {};

  await updateHousehold(householdId, {
    global_settings: {
      ...prev,
      grocery_credentials: credentials,
    },
  });
}

export async function saveOAuthTokens(
  householdId: string,
  provider: GroceryProviderId,
  tokens: {
    accessToken: string;
    refreshToken?: string;
    expiresIn?: number;
    tokenType?: string;
    scope?: string;
    externalAccountId?: string;
  },
): Promise<void> {
  const expiresAt =
    tokens.expiresIn != null
      ? new Date(Date.now() + tokens.expiresIn * 1000).toISOString()
      : undefined;

  await saveGroceryCredentials(householdId, {
    provider,
    accessTokenEnc: await encryptSecret(tokens.accessToken),
    refreshTokenEnc: tokens.refreshToken
      ? await encryptSecret(tokens.refreshToken)
      : undefined,
    expiresAt,
    tokenType: tokens.tokenType,
    scope: tokens.scope,
    externalAccountId: tokens.externalAccountId,
    updatedAt: new Date().toISOString(),
  });
}
