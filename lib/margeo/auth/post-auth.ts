import { DRIVEELY_PATHS } from "@/lib/margeo/constants";
import { ensureProfileForUser } from "@/lib/margeo/services/profile";

/** Destination après signup / login selon l'état onboarding. */
export async function getPostAuthPath(
  userId: string,
  name?: string,
): Promise<string> {
  const profile = await ensureProfileForUser(userId, name);
  if (profile?.onboardingCompleted) {
    return DRIVEELY_PATHS.dashboard;
  }
  return DRIVEELY_PATHS.onboarding;
}
