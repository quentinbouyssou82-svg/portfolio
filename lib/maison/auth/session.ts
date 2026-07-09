import { redirect } from "next/navigation";
import { MAISON_PATHS } from "@/lib/maison/constants";
import { isGroceryGateBypassed } from "@/lib/maison/dev/constants";
import {
  getGroceryIntegration,
  isGroceryProviderConnected,
} from "@/lib/maison/grocery-providers";
import { getMaisonSessionFromCookie } from "@/lib/maison/household-session";
import { getMemberWithPreferences, getHousehold } from "@/lib/maison/services/households";
import type { MaisonSessionContext } from "@/lib/maison/types";

export async function getMaisonSession(): Promise<MaisonSessionContext | null> {
  try {
    const payload = await getMaisonSessionFromCookie();
    if (!payload) return null;

    const household = await getHousehold(payload.householdId);
    if (!household) return null;

    const member = await getMemberWithPreferences(payload.memberId);
    if (!member || member.household_id !== payload.householdId) return null;

    return {
      householdId: payload.householdId,
      memberId: payload.memberId,
      role: member.role,
      household,
      member,
    };
  } catch {
    return null;
  }
}

export async function requireMaisonSession(): Promise<MaisonSessionContext> {
  const session = await getMaisonSession();
  if (!session) redirect(MAISON_PATHS.connexion);
  return session;
}

export async function requireMaisonAppSession(): Promise<MaisonSessionContext> {
  const session = await requireMaisonSession();
  if (!session.household.onboarding_completed) {
    if (session.role === "admin") {
      redirect(MAISON_PATHS.onboarding);
    }
    redirect(MAISON_PATHS.enAttente);
  }

  if (!isGroceryGateBypassed(session.household.household_key)) {
    const integration = await getGroceryIntegration(session.householdId);
    if (!isGroceryProviderConnected(integration)) {
      redirect(MAISON_PATHS.connexionCourses);
    }
  }

  return session;
}

/** Session pour la page connexion supermarché (sans boucle de redirection) */
export async function requireMaisonGrocerySetupSession(): Promise<MaisonSessionContext> {
  const session = await requireMaisonSession();
  if (!session.household.onboarding_completed) {
    if (session.role === "admin") {
      redirect(MAISON_PATHS.onboarding);
    }
    redirect(MAISON_PATHS.enAttente);
  }
  return session;
}

export async function requireMaisonAdmin(): Promise<MaisonSessionContext> {
  const session = await requireMaisonAppSession();
  if (session.role !== "admin") redirect(MAISON_PATHS.home);
  return session;
}
