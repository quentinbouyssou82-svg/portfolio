import type {
  GroceryCategory,
  GroceryExportPayload,
  GroceryItem,
  GroceryList,
  Meal,
  MealPlan,
} from "@/lib/maison/types";
import { getMaisonDb } from "@/lib/maison/supabase/server";
import { getMealsFromPlan } from "@/lib/maison/services/meals";
import { getWeekStart } from "@/lib/maison/utils/date";

function normalizeCategory(cat: string): GroceryCategory {
  const map: Record<string, GroceryCategory> = {
    fruits: "fruits",
    legumes: "legumes",
    viande: "viande",
    poisson: "poisson",
    produits_laitiers: "produits_laitiers",
    epicerie: "epicerie",
    surgeles: "surgeles",
    boissons: "boissons",
  };
  return map[cat] ?? "epicerie";
}

function mergeMealsToItems(meals: Meal[]): GroceryItem[] {
  const merged = new Map<string, GroceryItem>();

  for (const meal of meals) {
    for (const ing of meal.ingredients ?? []) {
      const key = ing.name.toLowerCase().trim();
      const price = ing.pricePerUnit ?? 2.0;
      const existing = merged.get(key);

      if (existing) {
        existing.price_est = Math.max(existing.price_est, price);
      } else {
        merged.set(key, {
          id: crypto.randomUUID(),
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit ?? null,
          category: normalizeCategory(ing.category),
          price_est: price,
          checked: false,
        });
      }
    }
  }

  return [...merged.values()];
}

export async function generateGroceryList(
  householdId: string,
  mealPlan: MealPlan,
): Promise<GroceryList> {
  const meals = getMealsFromPlan(mealPlan);
  const items = mergeMealsToItems(meals);
  const total = items.reduce((s, i) => s + i.price_est, 0);
  const payload = { items, total_estimated: total };

  const { data: existing } = await getMaisonDb()
    .from("grocery_lists")
    .select("*")
    .eq("household_id", householdId)
    .eq("meal_plan_id", mealPlan.id)
    .maybeSingle();

  if (existing) {
    const { data, error } = await getMaisonDb()
      .from("grocery_lists")
      .update({ items: payload, status: "finalized" })
      .eq("id", existing.id)
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return data as GroceryList;
  }

  const { data, error } = await getMaisonDb()
    .from("grocery_lists")
    .insert({
      household_id: householdId,
      meal_plan_id: mealPlan.id,
      items: payload,
      status: "finalized",
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as GroceryList;
}

export async function getGroceryList(listId: string): Promise<GroceryList | null> {
  const { data, error } = await getMaisonDb()
    .from("grocery_lists")
    .select("*")
    .eq("id", listId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as GroceryList) ?? null;
}

export async function getActiveGroceryList(householdId: string): Promise<GroceryList | null> {
  const weekStart = getWeekStart();
  const { data: plan } = await getMaisonDb()
    .from("meal_plans")
    .select("id")
    .eq("household_id", householdId)
    .eq("week_start", weekStart)
    .maybeSingle();

  if (!plan) return null;

  const { data: list } = await getMaisonDb()
    .from("grocery_lists")
    .select("*")
    .eq("household_id", householdId)
    .eq("meal_plan_id", plan.id)
    .maybeSingle();

  return (list as GroceryList) ?? null;
}

export async function toggleGroceryItem(
  listId: string,
  itemId: string,
  checked: boolean,
): Promise<void> {
  const list = await getGroceryList(listId);
  if (!list) throw new Error("Liste introuvable");

  const items = list.items.items.map((i) =>
    i.id === itemId ? { ...i, checked } : i,
  );

  const { error } = await getMaisonDb()
    .from("grocery_lists")
    .update({ items: { ...list.items, items } })
    .eq("id", listId);

  if (error) throw new Error(error.message);
}

export async function validateGroceryList(listId: string): Promise<GroceryList> {
  const { data, error } = await getMaisonDb()
    .from("grocery_lists")
    .update({ status: "finalized" })
    .eq("id", listId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as GroceryList;
}

function parseQuantity(qty: string): number {
  const n = parseFloat(qty.replace(",", "."));
  return Number.isFinite(n) ? n : 1;
}

export function buildGroceryExport(
  list: GroceryList,
  householdName: string,
): GroceryExportPayload {
  return {
    merchant: "leclerc_drive",
    generatedAt: new Date().toISOString(),
    householdName,
    items: list.items.items.map((item) => ({
      name: item.name.toLowerCase(),
      quantity: parseQuantity(item.quantity),
      unit: item.unit ?? "pièce",
    })),
  };
}

export async function markGroceryExported(listId: string): Promise<void> {
  const { error } = await getMaisonDb()
    .from("grocery_lists")
    .update({ status: "exported" })
    .eq("id", listId);

  if (error) throw new Error(error.message);
}
