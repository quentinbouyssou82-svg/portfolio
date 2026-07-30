import { cookies } from "next/headers";
import { DRIVEELY_PATHS } from "@/lib/margeo/constants";
import {
  buildHowItWorksPath,
  HOW_IT_WORKS_COOKIE,
  isHowItWorksCookieValue,
} from "@/lib/margeo/how-it-works";
import { ensureProfileForUser } from "@/lib/margeo/services/profile";

/** Destination après signup / login selon l'état onboarding. */
export async function getPostAuthPath(
  userId: string,
  name?: string,
): Promise<string> {
  const profile = await ensureProfileForUser(userId, name);
  const next = profile?.onboardingCompleted
    ? DRIVEELY_PATHS.dashboard
    : DRIVEELY_PATHS.onboarding;

  try {
    const jar = await cookies();
    if (isHowItWorksCookieValue(jar.get(HOW_IT_WORKS_COOKIE)?.value)) {
      return next;
    }
  } catch {
    // hors contexte request — still send to tour (first-run safe)
  }

  // First account / unseen tour: always land on /comment-ca-marche first.
  return buildHowItWorksPath(next);
}
