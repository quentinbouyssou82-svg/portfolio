import { AppShell } from "@/components/margeo/app-shell";
import { waitForAuthUser, waitForProfile } from "@/lib/margeo/auth/wait";
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
  // Retry session+profile before bouncing to login — post-login JWT/cookie
  // races previously flashed error/Retry pages while auth was already valid.
  const user = await waitForAuthUser();
  if (!user) redirect(DRIVEELY_PATHS.login);

  const profile = await waitForProfile(user);
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
