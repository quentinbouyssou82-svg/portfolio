import { AppShell } from "@/components/margeo/app-shell";
import { getAuthUser } from "@/lib/margeo/auth/session";
import { ensureProfileForUser } from "@/lib/margeo/services/profile";
import { repairOnboardingCompletedIfNeeded } from "@/lib/margeo/onboarding-repair";
import { resolveOnboardingStatus } from "@/lib/margeo/onboarding-status";
import { DRIVEELY_PATHS } from "@/lib/margeo/constants";
import {
  HOW_IT_WORKS_COOKIE,
  buildHowItWorksPath,
  isHowItWorksCookieValue,
} from "@/lib/margeo/how-it-works";
import { buildDriveelyMetadata } from "@/lib/margeo/seo";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = buildDriveelyMetadata({
  title: "App",
  description: "Espace Driveely — analyses et tableau de bord.",
  path: "/dashboard",
  index: false,
  follow: false,
});

export default async function MargeoShellLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getAuthUser();
  if (!user) redirect(DRIVEELY_PATHS.login);

  const profile = await ensureProfileForUser(
    user.id,
    user.user_metadata?.name as string | undefined,
    {
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
    },
  );
  if (!profile) redirect(DRIVEELY_PATHS.login);

  const status = resolveOnboardingStatus(
    {
      onboarding_completed: profile.onboardingCompleted,
      vehicle: profile.vehicle,
      target_hourly: profile.targetHourly,
      empty_returns: profile.emptyReturns,
      weekly_hours: profile.weeklyHours,
    },
    user,
  );

  if (status === "complete") {
    await repairOnboardingCompletedIfNeeded(
      user.id,
      {
        onboarding_completed: profile.onboardingCompleted,
        vehicle: profile.vehicle,
        target_hourly: profile.targetHourly,
        empty_returns: profile.emptyReturns,
        weekly_hours: profile.weeklyHours,
      },
      user,
    );
  } else if (status === "incomplete") {
    const jar = await cookies();
    if (!isHowItWorksCookieValue(jar.get(HOW_IT_WORKS_COOKIE)?.value)) {
      redirect(buildHowItWorksPath(DRIVEELY_PATHS.onboarding));
    }
    redirect(DRIVEELY_PATHS.onboarding);
  }
  // unknown : ne pas reboucler — profil vient d'être assuré

  return <AppShell profile={profile}>{children}</AppShell>;
}
