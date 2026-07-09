import type { MealMemberProfile } from "@/lib/maison/services/members";
import type { Meal, MealType } from "@/lib/maison/types";
import { addDays } from "@/lib/maison/utils/date";

const MEAL_SLOTS: MealType[] = ["breakfast", "lunch", "dinner"];

function normalizeTerm(term: string): string {
  return term
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .trim();
}

function mealText(meal: Meal): string {
  const parts = [
    meal.title,
    meal.description ?? "",
    ...meal.ingredients.map((i) => i.name),
  ];
  return normalizeTerm(parts.join(" "));
}

export function collectForbiddenTerms(members: MealMemberProfile[]): string[] {
  const terms = new Set<string>();
  for (const member of members) {
    for (const item of [...member.allergies, ...member.disliked_foods]) {
      const t = normalizeTerm(item);
      if (t.length >= 2) terms.add(t);
    }
  }
  return [...terms];
}

export function mealViolatesPreferences(
  meal: Meal,
  members: MealMemberProfile[],
): string | null {
  const text = mealText(meal);
  for (const member of members) {
    for (const allergy of member.allergies) {
      const term = normalizeTerm(allergy);
      if (term.length >= 2 && text.includes(term)) {
        return `« ${meal.title} » contient « ${allergy} » (allergie de ${member.name})`;
      }
    }
    for (const disliked of member.disliked_foods) {
      const term = normalizeTerm(disliked);
      if (term.length >= 3 && text.includes(term)) {
        return `« ${meal.title} » contient « ${disliked} » (refusé par ${member.name})`;
      }
    }
  }
  return null;
}

export function validateMealPlan(
  meals: Meal[],
  members: MealMemberProfile[],
  weekStart: string,
): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  for (const date of weekDates) {
    for (const slot of MEAL_SLOTS) {
      const found = meals.some((m) => m.day_date === date && m.meal_type === slot);
      if (!found) {
        issues.push(`Repas manquant : ${slot} le ${date}`);
      }
    }
  }

  for (const meal of meals) {
    const violation = mealViolatesPreferences(meal, members);
    if (violation) issues.push(violation);
  }

  const totalCost = meals.reduce((sum, m) => sum + m.cost_est, 0);
  if (meals.length > 0 && totalCost <= 0) {
    issues.push("Estimation budgétaire invalide (coût total nul).");
  }

  return { valid: issues.length === 0, issues };
}

export function buildValidationRetryHint(issues: string[]): string {
  return `
CORRECTION OBLIGATOIRE — le planning précédent était invalide :
${issues.slice(0, 8).map((i) => `- ${i}`).join("\n")}
Regénère un planning complet en respectant strictement ces contraintes.
`;
}
