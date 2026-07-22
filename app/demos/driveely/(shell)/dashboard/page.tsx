import { DashboardView } from "@/components/margeo/dashboard-view";
import { getCurrentProfile } from "@/lib/margeo/services/profile";
import { getUserDashboardData } from "@/lib/margeo/services/stats";
import { DRIVEELY_PATHS } from "@/lib/margeo/constants";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  if (!profile?.id) redirect(DRIVEELY_PATHS.login);

  const { stats, earnings, recent, analyses } = await getUserDashboardData(profile.id);

  return (
    <DashboardView
      profile={profile}
      stats={stats}
      earnings={earnings}
      recent={recent}
      analyses={analyses}
    />
  );
}
