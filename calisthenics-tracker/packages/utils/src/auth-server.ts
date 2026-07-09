import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

const SESSION_TOKEN_BYTES = 32;
const DEFAULT_SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 jours

/** Hash PIN pour comparaison constant-time (serveur uniquement). */
export function hashPin(pin: string, secret: string): string {
  return createHash("sha256")
    .update(`${secret}:${pin}`)
    .digest("hex");
}

export function verifyPin(pin: string, expectedPin: string, secret: string): boolean {
  const a = Buffer.from(hashPin(pin, secret));
  const b = Buffer.from(hashPin(expectedPin, secret));
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function generateSessionToken(): string {
  return randomBytes(SESSION_TOKEN_BYTES).toString("base64url");
}

export function getSessionExpiry(ttlMs = DEFAULT_SESSION_TTL_MS): Date {
  return new Date(Date.now() + ttlMs);
}
