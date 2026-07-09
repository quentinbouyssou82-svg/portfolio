import { requireMaisonAppSession } from "@/lib/maison/auth/session";
import { MaisonCoursesClient } from "@/components/maison/maison-courses-client";
import { generateGroceryList } from "@/lib/maison/services/groceries";
import { getCurrentWeekPlan, getMealsFromPlan, getOrCreateMealPlan } from "@/lib/maison/services/meals";
import { groupGroceryItems } from "@/lib/maison/utils/groceries";

export default async function MaisonCoursesPage() {
  const session = await requireMaisonAppSession();
  const plan = (await getCurrentWeekPlan(session.householdId)) ??
    (await getOrCreateMealPlan(session.householdId));

  let list = null;
  try {
    if (plan && getMealsFromPlan(plan).length > 0) {
      list = await generateGroceryList(session.householdId, plan);
    }
  } catch {
    list = null;
  }

  const items = list?.items.items ?? [];
  const groups = groupGroceryItems(items);

  return (
    <MaisonCoursesClient
      groups={groups}
      total={list?.items.total_estimated ?? 0}
      listId={list?.id ?? null}
      isAdmin={session.role === "admin"}
    />
  );
}
