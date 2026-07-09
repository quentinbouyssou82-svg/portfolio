import type { Meal, MealPlan } from "@/lib/maison/types";
import { getMaisonDb } from "@/lib/maison/supabase/server";
import {
  generateWeekMealPlan,
  regenerateMealWithAI,
} from "@/lib/maison/services/meal-engine";
import { addDays, getWeekStart } from "@/lib/maison/utils/date";

export async function getOrCreateMealPlan(
  householdId: string,
  weekStart?: string,
): Promise<MealPlan> {
  const start = weekStart ?? getWeekStart();
  const end = addDays(start, 6);

  const { data: existing } = await getMaisonDb()
    .from("meal_plans")
    .select("*")
    .eq("household_id", householdId)
    .eq("week_start", start)
    .maybeSingle();

  if (existing) return existing as MealPlan;

  const { data: created, error } = await getMaisonDb()
    .from("meal_plans")
    .insert({
      household_id: householdId,
      week_start: start,
      week_end: end,
      data: { meals: [] },
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return created as MealPlan;
}

export function getMealsFromPlan(plan: MealPlan): Meal[] {
  return plan.data?.meals ?? [];
}

export async function generateWeekMeals(
  householdId: string,
  weekStart?: string,
): Promise<MealPlan> {
  const start = weekStart ?? getWeekStart();
  const end = addDays(start, 6);

  const { meals } = await generateWeekMealPlan(householdId, start);

  const { data, error } = await getMaisonDb()
    .from("meal_plans")
    .upsert(
      {
        household_id: householdId,
        week_start: start,
        week_end: end,
        data: { meals },
      },
      { onConflict: "household_id,week_start" },
    )
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as MealPlan;
}

export async function regenerateMeal(
  householdId: string,
  mealId: string,
): Promise<Meal> {
  const start = getWeekStart();
  const plan = await getOrCreateMealPlan(householdId, start);
  const meals = getMealsFromPlan(plan);
  const idx = meals.findIndex((m) => m.id === mealId);
  if (idx === -1) throw new Error("Repas introuvable");

  const { meals: replacements } = await regenerateMealWithAI(householdId, meals[idx]);
  meals[idx] = replacements[0];

  const { error } = await getMaisonDb()
    .from("meal_plans")
    .update({ data: { meals } })
    .eq("id", plan.id);

  if (error) throw new Error(error.message);
  return meals[idx];
}

export async function getMealPlanHistory(householdId: string, limit = 8): Promise<MealPlan[]> {
  const { data, error } = await getMaisonDb()
    .from("meal_plans")
    .select("*")
    .eq("household_id", householdId)
    .order("week_start", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []) as MealPlan[];
}

export async function getCurrentWeekPlan(householdId: string): Promise<MealPlan | null> {
  const start = getWeekStart();
  const { data } = await getMaisonDb()
    .from("meal_plans")
    .select("*")
    .eq("household_id", householdId)
    .eq("week_start", start)
    .maybeSingle();

  return (data as MealPlan) ?? null;
}
