import { OnboardingWizard } from "@/components/margeo/onboarding/onboarding-wizard";
import type { OnboardingDraft } from "@/components/margeo/onboarding/onboarding-types";
import { getAuthUser } from "@/lib/margeo/auth/session";
import { UBERLY_PATHS } from "@/lib/margeo/constants";
import { ensureProfileForUser } from "@/lib/margeo/services/profile";
import type { Vehicle } from "@/lib/margeo/types";
import { redirect } from "next/navigation";

function profileToDraft(profile: {
  vehicle: Vehicle;
  targetHourly: number;
  minBenefit?: number;
  maxDistanceKm?: number;
  emptyReturns?: "yes" | "no" | "short_only";
  weeklyHours?: "under_10" | "10_20" | "20_30" | "30_40" | "over_40";
}): Partial<OnboardingDraft> {
  return {
    vehicle: profile.vehicle,
    targetHourly: profile.targetHourly,
    minBenefit: profile.minBenefit ?? 6,
    maxDistanceKm: profile.maxDistanceKm ?? 8,
    emptyReturns: profile.emptyReturns ?? null,
    weeklyHours: profile.weeklyHours ?? null,
  };
}

export default async function MargeoOnboardingPage() {
  const user = await getAuthUser();
  if (!user) redirect(UBERLY_PATHS.login);

  const profile = await ensureProfileForUser(
    user.id,
    user.user_metadata?.name as string | undefined,
  );
  if (!profile) redirect(UBERLY_PATHS.login);
  if (profile.onboardingCompleted) redirect(UBERLY_PATHS.dashboard);

  return (
    <div className="flex min-h-dvh items-center justify-center p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))]">
      <OnboardingWizard initial={profileToDraft(profile)} />
    </div>
  );
}
