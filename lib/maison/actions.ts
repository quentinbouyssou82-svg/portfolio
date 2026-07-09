"use server";

import { revalidatePath } from "next/cache";
import { MAISON_PREFIX } from "@/lib/maison/constants";
import { requireMaisonAdmin, requireMaisonSession } from "@/lib/maison/auth/session";
import { updateHousehold } from "@/lib/maison/services/households";
import { syncBudgetForWeek } from "@/lib/maison/services/budget-nutrition";
import {
  buildGroceryExport,
  generateGroceryList,
  markGroceryExported,
  toggleGroceryItem,
  validateGroceryList,
} from "@/lib/maison/services/groceries";
import {
  generateWeekMeals,
  getOrCreateMealPlan,
  getMealsFromPlan,
  regenerateMeal,
} from "@/lib/maison/services/meals";
import {
  createMember,
  deleteMember,
  updateMemberPreferences,
  type MemberInput,
} from "@/lib/maison/services/members";
import { formatMealGenerationError } from "@/lib/maison/errors";
import { emptyMemberFoodProfile } from "@/lib/maison/foods/sync";
import type { MemberFoodProfile } from "@/lib/maison/foods/types";
import {
  getMemberFoodProfile,
  saveMemberFoodProfile,
} from "@/lib/maison/services/preferences";
import type { ActionResult, GroceryExportPayload } from "@/lib/maison/types";

import { weeklyBudgetFromMonthly } from "@/lib/maison/types";

function revalidateMaison() {
  revalidatePath(MAISON_PREFIX, "layout");
}

function mealActionError(e: unknown): ActionResult<never> {
  return { ok: false, message: formatMealGenerationError(e) };
}

export async function generateMealPlanAction(): Promise<ActionResult<{ planId: string }>> {
  try {
    const session = await requireMaisonAdmin();
    const plan = await generateWeekMeals(session.householdId);
    await generateGroceryList(session.householdId, plan);
    await syncBudgetForWeek(session.householdId);
    revalidateMaison();
    return { ok: true, data: { planId: plan.id } };
  } catch (e) {
    return mealActionError(e);
  }
}

export async function regenerateMealAction(mealId: string): Promise<ActionResult> {
  try {
    const session = await requireMaisonAdmin();
    await regenerateMeal(session.householdId, mealId);
    revalidateMaison();
    return { ok: true };
  } catch (e) {
    return mealActionError(e);
  }
}

export async function createMemberAction(
  input: Omit<MemberInput, "pin"> & { pin: string },
): Promise<ActionResult> {
  try {
    const session = await requireMaisonAdmin();
    await createMember(session.householdId, input);
    revalidateMaison();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Erreur" };
  }
}

export async function updateMemberAction(
  memberId: string,
  input: Parameters<typeof updateMemberPreferences>[1],
): Promise<ActionResult> {
  try {
    const session = await requireMaisonSession();
    if (session.role !== "admin" && session.memberId !== memberId) {
      return { ok: false, message: "Accès refusé" };
    }
    await updateMemberPreferences(memberId, input);
    revalidateMaison();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Erreur" };
  }
}

export async function deleteMemberAction(memberId: string): Promise<ActionResult> {
  try {
    const session = await requireMaisonAdmin();
    if (memberId === session.memberId) {
      return { ok: false, message: "Vous ne pouvez pas supprimer votre propre profil." };
    }
    await deleteMember(memberId);
    revalidateMaison();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Erreur" };
  }
}

export async function completeOnboardingAction(): Promise<
  ActionResult<{ warning?: string }>
> {
  const { completeOnboardingAction: complete } = await import(
    "@/lib/maison/onboarding-actions"
  );
  return complete();
}

export async function toggleGroceryItemAction(
  listId: string,
  itemId: string,
  checked: boolean,
): Promise<ActionResult> {
  try {
    await requireMaisonSession();
    await toggleGroceryItem(listId, itemId, checked);
    revalidateMaison();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Erreur" };
  }
}

export async function validateGroceryListAction(listId: string): Promise<ActionResult> {
  try {
    await requireMaisonAdmin();
    await validateGroceryList(listId);
    revalidateMaison();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Erreur" };
  }
}

export async function exportGroceryListAction(
  listId: string,
): Promise<ActionResult<GroceryExportPayload>> {
  try {
    const session = await requireMaisonAdmin();
    const { getGroceryList } = await import("@/lib/maison/services/groceries");
    const list = await getGroceryList(listId);
    if (!list) return { ok: false, message: "Liste introuvable" };

    const payload = buildGroceryExport(list, session.household.name);
    await markGroceryExported(listId);
    return { ok: true, data: payload };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Erreur export" };
  }
}

export async function updateBudgetAction(weeklyBudget: number): Promise<ActionResult> {
  try {
    const session = await requireMaisonAdmin();
    const budgetMonthly = Math.round(weeklyBudget * 4.33);
    await updateHousehold(session.householdId, { budget_monthly: budgetMonthly });
    await syncBudgetForWeek(session.householdId);
    revalidateMaison();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Erreur" };
  }
}

export async function getMemberTasteProfileAction(
  memberId?: string,
): Promise<ActionResult<MemberFoodProfile>> {
  try {
    const session = await requireMaisonSession();
    const targetId = memberId ?? session.memberId;

    if (targetId !== session.memberId && session.role !== "admin") {
      return { ok: false, message: "Accès refusé." };
    }

    const profile = await getMemberFoodProfile(targetId);
    return { ok: true, data: profile ?? emptyMemberFoodProfile() };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Erreur" };
  }
}

export async function saveMemberTasteProfileAction(
  profile: MemberFoodProfile,
  memberId?: string,
): Promise<ActionResult<MemberFoodProfile>> {
  try {
    const session = await requireMaisonSession();
    const targetId = memberId ?? session.memberId;

    if (targetId !== session.memberId && session.role !== "admin") {
      return { ok: false, message: "Accès refusé." };
    }

    const saved = await saveMemberFoodProfile(targetId, profile);
    revalidateMaison();
    return { ok: true, data: saved };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Erreur sauvegarde" };
  }
}

export { weeklyBudgetFromMonthly };
