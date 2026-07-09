import { AppShell } from "@/components/margeo/app-shell";
import { getCurrentProfile } from "@/lib/margeo/services/profile";
import { UBERLY_PATHS } from "@/lib/margeo/constants";
import { redirect } from "next/navigation";

export default async function MargeoShellLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const profile = await getCurrentProfile();
  if (!profile) redirect(UBERLY_PATHS.login);
  if (!profile.onboardingCompleted) redirect(UBERLY_PATHS.onboarding);

  return <AppShell profile={profile}>{children}</AppShell>;
}
