import { AppShell } from "@/components/margeo/app-shell";
import { getAuthUser } from "@/lib/margeo/auth/session";
import { ensureProfileForUser } from "@/lib/margeo/services/profile";
import { DRIVEELY_PATHS } from "@/lib/margeo/constants";
import { redirect } from "next/navigation";

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
  if (!profile.onboardingCompleted) redirect(DRIVEELY_PATHS.onboarding);

  return <AppShell profile={profile}>{children}</AppShell>;
}
