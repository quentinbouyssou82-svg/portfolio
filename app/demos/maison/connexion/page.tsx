import { redirect } from "next/navigation";
import { MaisonHouseholdForm } from "@/components/maison/maison-household-form";
import { getMaisonSession } from "@/lib/maison/auth/session";
import { getMaisonConfigStatus } from "@/lib/maison/env";
import { getMaisonSessionFromCookie } from "@/lib/maison/household-session";
import { MAISON_PATHS } from "@/lib/maison/constants";

export default async function MaisonConnexionPage() {
  const cookiePayload = await getMaisonSessionFromCookie();
  const session = await getMaisonSession();

  // Cookie valide mais foyer/membre introuvable → route de déconnexion
  if (cookiePayload && !session) {
    redirect(MAISON_PATHS.deconnexion);
  } else if (session) {
    if (session.household.onboarding_completed) {
      redirect(MAISON_PATHS.home);
    }
    if (session.role === "admin") {
      redirect(MAISON_PATHS.onboarding);
    }
    redirect(MAISON_PATHS.enAttente);
  }

  const { configured, missing } = getMaisonConfigStatus();
  return <MaisonHouseholdForm configured={configured} missingVars={missing} />;
}
