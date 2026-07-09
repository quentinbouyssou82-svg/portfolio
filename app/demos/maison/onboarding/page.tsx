import {
  MaisonOnboardingWizard,
  type OnboardingInitial,
  type OnboardingMember,
} from "@/components/maison/maison-onboarding-wizard";
import { getMaisonSession } from "@/lib/maison/auth/session";
import { getMaisonConfigStatus } from "@/lib/maison/env";
import { isGroceryGateBypassed } from "@/lib/maison/dev/constants";
import { getGroceryIntegration } from "@/lib/maison/grocery-providers";
import { getHouseholdMembers } from "@/lib/maison/services/members";
import type { GroceryIntegration } from "@/lib/maison/types";

function parseAge(goals: string | null): number | null {
  if (!goals) return null;
  const match = goals.match(/^(\d+)\s*ans$/);
  return match ? parseInt(match[1], 10) : null;
}

function toOnboardingMember(m: { id: string; name: string; role: "admin" | "member"; goals: string | null }): OnboardingMember {
  return {
    id: m.id,
    name: m.name,
    role: m.role,
    age: parseAge(m.goals),
  };
}

export default async function MaisonOnboardingPage() {
  const { configured, missing } = getMaisonConfigStatus();
  const session = await getMaisonSession();

  let initial: OnboardingInitial | null = null;

  if (
    session &&
    session.role === "admin" &&
    !session.household.onboarding_completed
  ) {
    const members = await getHouseholdMembers(session.householdId);
    const groceryProvider = await getGroceryIntegration(session.householdId);
    initial = {
      householdName: session.household.name,
      householdKey: session.household.household_key,
      members: members.map(toOnboardingMember),
      groceryProvider: groceryProvider as GroceryIntegration | null,
    };
  }

  const groceryOptional =
    session && isGroceryGateBypassed(session.household.household_key);

  return (
    <MaisonOnboardingWizard
      initial={initial}
      configured={configured}
      missingVars={missing}
      groceryOptional={groceryOptional ?? false}
    />
  );
}
