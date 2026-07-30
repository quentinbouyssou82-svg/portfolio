"use server";

import { cookies } from "next/headers";
import {
  HOW_IT_WORKS_COOKIE,
  howItWorksCookieOptions,
} from "@/lib/margeo/how-it-works";

/** Persists the how-it-works "seen" flag as a first-party cookie (Secure on HTTPS). */
export async function markHowItWorksSeenAction(): Promise<{ ok: true }> {
  const jar = await cookies();
  const secure =
    process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
  jar.set(HOW_IT_WORKS_COOKIE, "1", howItWorksCookieOptions(secure));
  return { ok: true };
}
