import { getPinSecret } from "@/lib/maison/env";
import type { GroceryProviderId } from "@/lib/maison/grocery-providers/config";

export interface GroceryOAuthStatePayload {
  householdId: string;
  memberId: string;
  provider: GroceryProviderId;
  storeId?: string;
  returnPath: string;
  mode: "oauth" | "external";
  exp: number;
  nonce: string;
}

const STATE_TTL_SEC = 60 * 15;

async function signPayload(payload: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(`${getPinSecret()}:grocery-oauth`),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  const bytes = new Uint8Array(sig);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function verifySignature(payload: string, sig: string): Promise<boolean> {
  const expected = await signPayload(payload);
  if (expected.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  }
  return diff === 0;
}

function encodePayload(payload: GroceryOAuthStatePayload): string {
  return btoa(JSON.stringify(payload))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function decodePayload(encoded: string): GroceryOAuthStatePayload | null {
  try {
    const json = atob(encoded.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as GroceryOAuthStatePayload;
  } catch {
    return null;
  }
}

export async function createGroceryOAuthStateToken(
  input: Omit<GroceryOAuthStatePayload, "exp" | "nonce">,
): Promise<string> {
  const payload: GroceryOAuthStatePayload = {
    ...input,
    exp: Math.floor(Date.now() / 1000) + STATE_TTL_SEC,
    nonce: crypto.randomUUID(),
  };
  const payloadB64 = encodePayload(payload);
  const sig = await signPayload(payloadB64);
  return `${payloadB64}.${sig}`;
}

export async function parseGroceryOAuthStateToken(
  token: string | null | undefined,
): Promise<GroceryOAuthStatePayload | null> {
  if (!token) return null;
  const [payloadB64, sig] = token.split(".");
  if (!payloadB64 || !sig) return null;
  if (!(await verifySignature(payloadB64, sig))) return null;

  const payload = decodePayload(payloadB64);
  if (!payload) return null;
  if (payload.exp < Math.floor(Date.now() / 1000)) return null;
  if (!payload.householdId || !payload.memberId || !payload.provider) return null;
  return payload;
}
