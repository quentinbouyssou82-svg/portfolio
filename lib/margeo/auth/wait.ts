/**
 * Auth bootstrap helpers — absorb transient session/profile races after login.
 * Prefer waiting over bouncing to login / error UI.
 *
 * Edge-safe cookie check lives in `./cookie-presence` (middleware must not
 * import this file — it pulls Node server clients).
 */

import type { User } from "@supabase/supabase-js";
import { ensureProfileForUser } from "@/lib/margeo/services/profile";
import type { UserProfile } from "@/lib/margeo/types";
import { getAuthUser } from "./session";

export const AUTH_BOOTSTRAP_ATTEMPTS = 6;
export const AUTH_BOOTSTRAP_BASE_DELAY_MS = 120;

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function waitForAuthUser(
  attempts = AUTH_BOOTSTRAP_ATTEMPTS,
  baseDelayMs = AUTH_BOOTSTRAP_BASE_DELAY_MS,
): Promise<User | null> {
  let last: User | null = null;
  for (let i = 0; i < attempts; i++) {
    last = await getAuthUser();
    if (last) return last;
    if (i < attempts - 1) {
      await sleep(baseDelayMs * (i + 1));
    }
  }
  return last;
}

export async function waitForProfile(
  user: User,
  attempts = AUTH_BOOTSTRAP_ATTEMPTS,
  baseDelayMs = AUTH_BOOTSTRAP_BASE_DELAY_MS,
): Promise<UserProfile | null> {
  const meta = {
    first_name:
      typeof user.user_metadata?.first_name === "string"
        ? user.user_metadata.first_name
        : undefined,
    last_name:
      typeof user.user_metadata?.last_name === "string"
        ? user.user_metadata.last_name
        : undefined,
    avatar_url:
      typeof user.user_metadata?.avatar_url === "string"
        ? user.user_metadata.avatar_url
        : undefined,
    vehicle_details:
      user.user_metadata?.vehicle_details &&
      typeof user.user_metadata.vehicle_details === "object"
        ? (user.user_metadata.vehicle_details as Record<string, unknown>)
        : undefined,
  };
  const name = user.user_metadata?.name as string | undefined;

  let last: UserProfile | null = null;
  for (let i = 0; i < attempts; i++) {
    try {
      last = await ensureProfileForUser(user.id, name, meta);
      if (last) return last;
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[driveely/auth] profile wait attempt failed:", err);
      }
    }
    if (i < attempts - 1) {
      await sleep(baseDelayMs * (i + 1));
    }
  }
  return last;
}
