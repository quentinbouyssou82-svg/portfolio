import { cookies } from "next/headers";

export const PIN_SESSION_COOKIE = "ct_pin_session";
const SESSION_PAYLOAD = "control-tower-ok";

export function getControlTowerPin(): string | undefined {
  return process.env.CONTROL_TOWER_PIN?.trim();
}

export function getControlTowerUserId(): string | undefined {
  return process.env.CONTROL_TOWER_USER_ID?.trim();
}

function getSessionSecret(): string {
  return (
    process.env.CONTROL_TOWER_SESSION_SECRET?.trim() ||
    process.env.CONTROL_TOWER_PIN?.trim() ||
    ""
  );
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

async function hmacBase64Url(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  const bytes = new Uint8Array(sig);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function createSessionToken(): Promise<string> {
  const secret = getSessionSecret();
  if (!secret) return "";
  return hmacBase64Url(secret, SESSION_PAYLOAD);
}

export async function verifySessionToken(
  token: string | undefined,
): Promise<boolean> {
  if (!token) return false;
  const expected = await createSessionToken();
  if (!expected) return false;
  return constantTimeEqual(token, expected);
}

export function verifyPin(pin: string): boolean {
  const expected = getControlTowerPin();
  if (!expected || !pin) return false;
  return constantTimeEqual(pin, expected);
}

export async function isPinSessionValid(): Promise<boolean> {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(PIN_SESSION_COOKIE)?.value);
}

export async function setPinSessionCookie(): Promise<void> {
  const token = await createSessionToken();
  if (!token) {
    throw new Error("CONTROL_TOWER_PIN ou CONTROL_TOWER_SESSION_SECRET requis");
  }
  const cookieStore = await cookies();
  cookieStore.set(PIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 400,
  });
}

export async function clearPinSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete({ name: PIN_SESSION_COOKIE, path: "/" });
}
