import type { Budget, Meal, NutritionAnalysis } from "@/lib/maison/types";
import { weeklyBudgetFromMonthly } from "@/lib/maison/types";
import { getMaisonDb } from "@/lib/maison/supabase/server";
import { getCurrentWeekPlan, getMealsFromPlan } from "@/lib/maison/services/meals";
import { getHousehold } from "@/lib/maison/services/households";
import { getWeekStart } from "@/lib/maison/utils/date";

export async function syncBudgetForWeek(householdId: string, weekStart?: string): Promise<Budget> {
  const start = weekStart ?? getWeekStart();
  const household = await getHousehold(householdId);
  const weeklyPlanned = household ? weeklyBudgetFromMonthly(household.budget_monthly) : 120;

  const plan = await getCurrentWeekPlan(householdId);
  const meals = plan ? getMealsFromPlan(plan) : [];
  const estimated = meals.reduce((s, m) => s + m.cost_est, 0);

  const { data: existing } = await getMaisonDb()
    .from("budgets")
    .select("*")
    .eq("household_id", householdId)
    .eq("week_start", start)
    .maybeSingle();

  if (existing) {
    const { data, error } = await getMaisonDb()
      .from("budgets")
      .update({ estimated_cost: estimated })
      .eq("id", existing.id)
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return data as Budget;
  }

  const { data, error } = await getMaisonDb()
    .from("budgets")
    .insert({
      household_id: householdId,
      week_start: start,
      estimated_cost: estimated,
      actual_cost: 0,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return { ...(data as Budget), planned_weekly: weeklyPlanned } as Budget & { planned_weekly?: number };
}

export async function getCurrentBudget(householdId: string): Promise<{
  budget: Budget;
  plannedWeekly: number;
}> {
  const household = await getHousehold(householdId);
  const plannedWeekly = household ? weeklyBudgetFromMonthly(household.budget_monthly) : 120;
  const budget = await syncBudgetForWeek(householdId);
  return { budget, plannedWeekly };
}

export function analyzeNutrition(meals: Meal[]): NutritionAnalysis {
  const ingredientSet = new Set<string>();
  const titleCounts = new Map<string, number>();
  let weeklyCalories = 0;
  let weeklyProtein = 0;
  let weeklyCarbs = 0;
  let weeklyFat = 0;
  let vegetableCount = 0;
  let processedCount = 0;
  const processedKeywords = ["pâtes", "pain", "granola", "mie"];

  for (const meal of meals) {
    weeklyCalories += meal.calories_est;
    weeklyProtein += meal.protein_est;
    weeklyCarbs += meal.carbs_est;
    weeklyFat += meal.fat_est;
    titleCounts.set(meal.title, (titleCounts.get(meal.title) ?? 0) + 1);

    for (const ing of meal.ingredients ?? []) {
      ingredientSet.add(String(ing.name).toLowerCase());
      const name = String(ing.name).toLowerCase();
      if (["brocoli", "épinard", "courge", "tomate", "courgette", "salade"].some((k) => name.includes(k))) {
        vegetableCount++;
      }
    }
    if (processedKeywords.some((k) => meal.title.toLowerCase().includes(k))) processedCount++;
  }

  const uniqueIngredients = ingredientSet.size;
  const varietyScore = Math.min(100, Math.round((uniqueIngredients / 30) * 100));
  const proteinScore = Math.min(100, Math.round((weeklyProtein / Math.max(meals.length * 25, 1)) * 100));
  const vegetableScore = Math.min(100, Math.round((vegetableCount / Math.max(meals.length, 1)) * 80));
  const processedScore = Math.max(0, 100 - Math.round((processedCount / Math.max(meals.length, 1)) * 120));

  const recommendations: string[] = [];
  if (proteinScore < 65) recommendations.push("Manque probable de protéines — ajoutez lentilles, poisson ou œufs.");
  if (vegetableScore < 70) recommendations.push("Manque de variété en légumes — une salade ou un velouté équilibrerait la semaine.");
  if (processedScore < 60) recommendations.push("Excès d'aliments transformés — privilégiez le fait-maison 2 jours sur 3.");
  const repeated = [...titleCounts.entries()].filter(([, c]) => c > 1);
  if (repeated.length > 0) {
    recommendations.push(`Répétition : « ${repeated[0][0]} » apparaît ${repeated[0][1]} fois.`);
  }
  if (recommendations.length === 0) recommendations.push("Un bel équilibre cette semaine.");

  return {
    scores: [
      { label: "Variété", value: varietyScore, note: `${uniqueIngredients} ingrédients différents.`, type: "variety" },
      { label: "Protéines", value: proteinScore, note: "Répartition hebdomadaire estimée.", type: "protein" },
      { label: "Végétaux", value: vegetableScore, note: "Diversité de légumes.", type: "vegetables" },
      { label: "Transformés", value: processedScore, note: "Plus c'est haut, mieux c'est.", type: "processed" },
    ],
    recommendations,
    weeklyCalories: Math.round(weeklyCalories),
    weeklyProtein: Math.round(weeklyProtein),
    weeklyCarbs: Math.round(weeklyCarbs),
    weeklyFat: Math.round(weeklyFat),
    uniqueIngredients,
  };
}

export async function getNutritionAnalysis(householdId: string): Promise<NutritionAnalysis | null> {
  const plan = await getCurrentWeekPlan(householdId);
  if (!plan) return null;
  const meals = getMealsFromPlan(plan);
  if (!meals.length) return null;
  return analyzeNutrition(meals);
}
