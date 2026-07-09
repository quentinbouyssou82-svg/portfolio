import { cookies } from "next/headers";
import { MAISON_SESSION_COOKIE } from "@/lib/maison/constants";
import { getPinSecret } from "@/lib/maison/env";

export interface SessionPayload {
  householdId: string;
  memberId: string;
  exp: number;
}

const MAX_AGE_SEC = 60 * 60 * 24 * 90; // 90 jours

async function signPayload(payload: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(getPinSecret()),
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

export async function createSessionToken(
  householdId: string,
  memberId: string,
): Promise<string> {
  const payload: SessionPayload = {
    householdId,
    memberId,
    exp: Math.floor(Date.now() / 1000) + MAX_AGE_SEC,
  };
  const payloadB64 = btoa(JSON.stringify(payload))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  const sig = await signPayload(payloadB64);
  return `${payloadB64}.${sig}`;
}

export async function parseSessionToken(
  token: string | undefined,
): Promise<SessionPayload | null> {
  if (!token) return null;
  const [payloadB64, sig] = token.split(".");
  if (!payloadB64 || !sig) return null;
  if (!(await verifySignature(payloadB64, sig))) return null;

  try {
    const json = atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(json) as SessionPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    if (!payload.householdId || !payload.memberId) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function setMaisonSessionCookie(
  householdId: string,
  memberId: string,
): Promise<void> {
  const token = await createSessionToken(householdId, memberId);
  const cookieStore = await cookies();
  cookieStore.set(MAISON_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SEC,
  });
}

export async function clearMaisonSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete({ name: MAISON_SESSION_COOKIE, path: "/" });
}

export async function getMaisonSessionFromCookie(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  return parseSessionToken(cookieStore.get(MAISON_SESSION_COOKIE)?.value);
}

/** Pour middleware (Edge) — lit cookie depuis Request */
export async function getMaisonSessionFromRequest(
  request: { cookies: { get: (name: string) => { value: string } | undefined } },
): Promise<SessionPayload | null> {
  return parseSessionToken(request.cookies.get(MAISON_SESSION_COOKIE)?.value);
}
