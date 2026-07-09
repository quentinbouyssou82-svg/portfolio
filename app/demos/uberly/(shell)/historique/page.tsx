import { HistoriqueView } from "@/components/margeo/historique-view";
import { listAnalysesForUser } from "@/lib/margeo/services/analyses";
import { getCurrentProfile } from "@/lib/margeo/services/profile";
import { UBERLY_PATHS } from "@/lib/margeo/constants";
import { redirect } from "next/navigation";

export default async function HistoriquePage() {
  const profile = await getCurrentProfile();
  if (!profile?.id) redirect(UBERLY_PATHS.login);

  const analyses = await listAnalysesForUser(profile.id);

  return <HistoriqueView analyses={analyses} />;
}
