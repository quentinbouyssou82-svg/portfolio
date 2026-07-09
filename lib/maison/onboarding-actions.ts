"use server";

import { revalidatePath } from "next/cache";
import { requireMaisonSession } from "@/lib/maison/auth/session";
import { MAISON_PREFIX } from "@/lib/maison/constants";
import { syncBudgetForWeek } from "@/lib/maison/services/budget-nutrition";
import { generateGroceryList } from "@/lib/maison/services/groceries";
import { generateWeekMeals } from "@/lib/maison/services/meals";
import {
  createMember,
  deleteMember,
  getHouseholdMembers,
  updateMemberFull,
  type MemberInput,
} from "@/lib/maison/services/members";
import { updateHousehold } from "@/lib/maison/services/households";
import {
  connectGroceryProvider,
  getGroceryIntegration,
  isGroceryProviderConnected,
  type GroceryConnectMode,
} from "@/lib/maison/grocery-providers";
import type { GroceryProviderId } from "@/lib/maison/grocery-providers/config";
import { isGroceryGateBypassed } from "@/lib/maison/dev/constants";
import {
  confirmGroceryExternalLogin,
  GroceryOAuthError,
} from "@/lib/maison/grocery-providers/oauth";
import { getMaisonAppOrigin } from "@/lib/maison/grocery-providers/oauth-config";
import { emptyMemberFoodProfile } from "@/lib/maison/foods/sync";
import type { MemberFoodProfile } from "@/lib/maison/foods/types";
import { formatMealGenerationError } from "@/lib/maison/errors";
import {
  getMemberFoodProfile,
  memberHasTasteProfile,
  saveMemberFoodProfile,
} from "@/lib/maison/services/preferences";
import type { ActionResult, GroceryIntegration, MemberWithPreferences } from "@/lib/maison/types";

function revalidateMaison() {
  revalidatePath(MAISON_PREFIX, "layout");
}

async function requireOnboardingAdmin(options?: { allowCompleted?: boolean }) {
  const session = await requireMaisonSession();
  if (session.role !== "admin") {
    throw new Error("Seul l'administrateur peut configurer le foyer.");
  }
  if (!options?.allowCompleted && session.household.onboarding_completed) {
    throw new Error("Configuration déjà terminée.");
  }
  return session;
}

export async function listOnboardingMembersAction(): Promise<
  ActionResult<MemberWithPreferences[]>
> {
  try {
    const session = await requireOnboardingAdmin();
    const members = await getHouseholdMembers(session.householdId);
    return { ok: true, data: members };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Erreur" };
  }
}

export async function addOnboardingMemberAction(
  input: Pick<MemberInput, "name" | "pin" | "role" | "age">,
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await requireOnboardingAdmin();
    if (!input.name.trim()) return { ok: false, message: "Prénom requis." };
    if (input.pin.length < 4) return { ok: false, message: "PIN : minimum 4 chiffres." };

    const member = await createMember(session.householdId, {
      name: input.name,
      pin: input.pin,
      role: input.role ?? "member",
      age: input.age,
    });
    revalidateMaison();
    return { ok: true, data: { id: member.id } };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Erreur" };
  }
}

export async function updateOnboardingMemberAction(
  memberId: string,
  input: Partial<Pick<MemberInput, "name" | "pin" | "role" | "age">>,
): Promise<ActionResult> {
  try {
    const session = await requireOnboardingAdmin();
    if (input.pin !== undefined && input.pin.length > 0 && input.pin.length < 4) {
      return { ok: false, message: "PIN : minimum 4 chiffres." };
    }

    await updateMemberFull(session.householdId, memberId, {
      ...input,
      pin: input.pin || undefined,
    });
    revalidateMaison();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Erreur" };
  }
}

export async function deleteOnboardingMemberAction(memberId: string): Promise<ActionResult> {
  try {
    const session = await requireOnboardingAdmin();
    const members = await getHouseholdMembers(session.householdId);

    if (members.length <= 1) {
      return { ok: false, message: "Le foyer doit avoir au moins un membre." };
    }

    const target = members.find((m) => m.id === memberId);
    if (!target) return { ok: false, message: "Membre introuvable." };

    const adminCount = members.filter((m) => m.role === "admin").length;
    if (target.role === "admin" && adminCount <= 1) {
      return { ok: false, message: "Impossible de supprimer le dernier administrateur." };
    }

    await deleteMember(memberId);
    revalidateMaison();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Erreur" };
  }
}

export async function getMemberFoodProfileAction(
  memberId: string,
): Promise<ActionResult<MemberFoodProfile>> {
  try {
    const session = await requireMaisonSession();
    const members = await getHouseholdMembers(session.householdId);
    const member = members.find((m) => m.id === memberId);
    if (!member) return { ok: false, message: "Membre introuvable." };

    const isSelf = session.memberId === memberId;
    const isAdmin = session.role === "admin";
    if (!isSelf && !isAdmin) {
      return { ok: false, message: "Accès refusé." };
    }

    const profile = await getMemberFoodProfile(memberId);
    return { ok: true, data: profile ?? emptyMemberFoodProfile() };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Erreur" };
  }
}

async function assertCanEditMemberTaste(
  session: Awaited<ReturnType<typeof requireMaisonSession>>,
  memberId: string,
): Promise<void> {
  const members = await getHouseholdMembers(session.householdId);
  if (!members.some((m) => m.id === memberId)) {
    throw new Error("Membre introuvable.");
  }

  const isSelf = session.memberId === memberId;
  const isAdmin = session.role === "admin";
  const onboardingOpen = !session.household.onboarding_completed;

  if (onboardingOpen && !isAdmin) {
    throw new Error("Seul l'administrateur peut configurer le foyer.");
  }
  if (!onboardingOpen && !isSelf && !isAdmin) {
    throw new Error("Vous ne pouvez modifier que vos propres préférences.");
  }
}

export async function saveMemberFoodProfileAction(
  memberId: string,
  profile: MemberFoodProfile,
): Promise<ActionResult> {
  try {
    const session = await requireMaisonSession();
    await assertCanEditMemberTaste(session, memberId);
    await saveMemberFoodProfile(memberId, profile);
    revalidateMaison();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Erreur sauvegarde" };
  }
}

export async function connectGroceryProviderAction(
  provider: GroceryProviderId,
  mode: GroceryConnectMode,
  storeId?: string,
): Promise<ActionResult<GroceryIntegration>> {
  try {
    const session = await requireMaisonSession();
    if (session.role !== "admin") {
      return { ok: false, message: "Seul l'administrateur peut connecter le supermarché." };
    }

    const integration = await connectGroceryProvider(
      session.householdId,
      provider,
      mode,
      storeId,
    );
    revalidateMaison();
    return { ok: true, data: integration };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Erreur connexion supermarché" };
  }
}

/** @deprecated Use connectGroceryProviderAction */
export async function connectLeclercOnboardingAction(
  mode: GroceryConnectMode,
  storeId?: string,
): Promise<ActionResult<GroceryIntegration>> {
  return connectGroceryProviderAction("leclerc_drive", mode, storeId);
}

export async function confirmGroceryOAuthAction(
  stateToken: string,
): Promise<ActionResult<{ integration: GroceryIntegration; returnPath: string }>> {
  try {
    const session = await requireMaisonSession();
    if (session.role !== "admin") {
      return { ok: false, message: "Seul l'administrateur peut connecter le supermarché." };
    }

    const result = await confirmGroceryExternalLogin(stateToken);
    revalidateMaison();
    return { ok: true, data: result };
  } catch (e) {
    const message =
      e instanceof GroceryOAuthError ? e.message : e instanceof Error ? e.message : "Connexion échouée";
    return { ok: false, message };
  }
}

export async function getGroceryOAuthStartUrlAction(
  provider: GroceryProviderId,
  storeId?: string,
  returnPath?: string,
): Promise<ActionResult<{ url: string }>> {
  try {
    const session = await requireMaisonSession();
    if (session.role !== "admin") {
      return { ok: false, message: "Seul l'administrateur peut connecter le supermarché." };
    }

    const { buildGroceryOAuthAuthorizeUrl } = await import("@/lib/maison/grocery-providers/oauth");
    const url = await buildGroceryOAuthAuthorizeUrl({
      householdId: session.householdId,
      memberId: session.memberId,
      provider,
      storeId,
      returnPath,
      origin: getMaisonAppOrigin(),
    });
    return { ok: true, data: { url } };
  } catch (e) {
    const message =
      e instanceof GroceryOAuthError ? e.message : e instanceof Error ? e.message : "Erreur OAuth";
    return { ok: false, message };
  }
}

export async function completeOnboardingAction(): Promise<
  ActionResult<{ warning?: string }>
> {
  try {
    const session = await requireOnboardingAdmin({ allowCompleted: true });

    if (session.household.onboarding_completed) {
      revalidateMaison();
      return { ok: true };
    }

    const members = await getHouseholdMembers(session.householdId);

    const incomplete = members.filter((m) => !memberHasTasteProfile(m.preferences));
    if (incomplete.length > 0) {
      const names = incomplete.map((m) => m.name).join(", ");
      return {
        ok: false,
        message: `Profil gustatif incomplet pour : ${names}. Complétez régime et aliments pour chaque membre.`,
      };
    }

    if (!isGroceryGateBypassed(session.household.household_key)) {
      const integration = await getGroceryIntegration(session.householdId);
      if (!isGroceryProviderConnected(integration)) {
        return {
          ok: false,
          message:
            "Connectez e.Leclerc Drive, Netto ou une autre enseigne avant d'entrer dans Maison.",
        };
      }
    }

    await updateHousehold(session.householdId, { onboarding_completed: true });

    let warning: string | undefined;
    try {
      const plan = await generateWeekMeals(session.householdId);
      await generateGroceryList(session.householdId, plan);
      await syncBudgetForWeek(session.householdId);
    } catch (e) {
      warning = formatMealGenerationError(e);
    }

    revalidateMaison();
    return warning ? { ok: true, data: { warning } } : { ok: true };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Erreur onboarding" };
  }
}
