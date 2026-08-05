"use server";

import { getPostAuthPath } from "@/lib/margeo/auth/post-auth";
import { resolveSafePostAuthNext } from "@/lib/margeo/auth/safe-next";
import {
  waitForAuthUser,
  waitForProfile,
} from "@/lib/margeo/auth/wait";
import { DRIVEELY_PATHS } from "@/lib/margeo/constants";

export type AuthBootstrapResult =
  | { status: "ready"; redirectTo: string }
  | { status: "pending" }
  | { status: "unauthenticated" };

/**
 * Server probe used by the post-login continuing gate.
 * Returns ready only when session + profile are both available.
 */
export async function probeAuthBootstrapAction(
  preferredNext?: string,
): Promise<AuthBootstrapResult> {
  const user = await waitForAuthUser(3, 80);
  if (!user) return { status: "unauthenticated" };

  const profile = await waitForProfile(user, 3, 80);
  if (!profile) return { status: "pending" };

  const safePreferred = resolveSafePostAuthNext(preferredNext, "");
  let redirectTo = safePreferred;

  if (
    !redirectTo ||
    redirectTo === DRIVEELY_PATHS.login ||
    redirectTo.startsWith(`${DRIVEELY_PATHS.login}?`)
  ) {
    try {
      redirectTo = await getPostAuthPath(
        user.id,
        user.user_metadata?.name as string | undefined,
      );
    } catch {
      redirectTo = profile.onboardingCompleted
        ? DRIVEELY_PATHS.dashboard
        : DRIVEELY_PATHS.onboarding;
    }
  }

  return { status: "ready", redirectTo };
}
