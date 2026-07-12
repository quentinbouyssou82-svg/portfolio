import { UBERLY_PATHS } from "@/lib/margeo/constants";
import { ensureProfileForUser } from "@/lib/margeo/services/profile";

/** Destination après signup / login selon l'état onboarding. */
export async function getPostAuthPath(
  userId: string,
  name?: string,
): Promise<string> {
  const profile = await ensureProfileForUser(userId, name);
  if (profile?.onboardingCompleted) {
    return UBERLY_PATHS.dashboard;
  }
  return UBERLY_PATHS.onboarding;
}
