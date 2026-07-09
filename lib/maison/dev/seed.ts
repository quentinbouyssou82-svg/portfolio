import { DEV_ADMIN_PIN, DEV_HOUSEHOLD_KEY } from "@/lib/maison/dev/constants";
import { setMaisonSessionCookie } from "@/lib/maison/household-session";
import { getHouseholdByKey } from "@/lib/maison/services/households";
import { createMember, getHouseholdMembers } from "@/lib/maison/services/members";
import { generateWeekMeals } from "@/lib/maison/services/meals";
import { generateGroceryList } from "@/lib/maison/services/groceries";
import { syncBudgetForWeek } from "@/lib/maison/services/budget-nutrition";
import { connectGroceryProvider } from "@/lib/maison/grocery-providers";
import type { MemberFoodProfile } from "@/lib/maison/foods/types";
import { saveMemberFoodProfile } from "@/lib/maison/services/preferences";

const DEV_PROFILES: Array<{ name: string; role: "admin" | "member"; profile: MemberFoodProfile }> = [
  {
    name: "Quentin",
    role: "admin",
    profile: {
      dietType: "omnivore",
      foodRatings: {
        poulet: "like",
        riz: "like",
        tomate: "like",
        brocoli: "like",
        saumon: "like",
        pain: "like",
        porc: "dislike",
      },
      allergies: [],
      forbiddenFoods: [],
      intolerances: [],
      consumptionHabits: { poulet: "often", riz: "often", salade: "sometimes" },
      dislikeLevels: { porc: "sometimes" },
      preferredMeals: ["lunch", "dinner"],
    },
  },
  {
    name: "Marie",
    role: "member",
    profile: {
      dietType: "vegetarian",
      foodRatings: {
        fromage: "like",
        pates: "like",
        courgette: "like",
        oeuf: "like",
        boeuf: "dislike",
        poulet: "dislike",
      },
      allergies: ["Lactose"],
      forbiddenFoods: [],
      intolerances: ["Lactose"],
      consumptionHabits: { pates: "often", salade: "often" },
      dislikeLevels: { boeuf: "often", poulet: "often" },
      preferredMeals: ["lunch", "dinner", "snack"],
    },
  },
  {
    name: "Chloé",
    role: "member",
    profile: {
      dietType: "omnivore",
      foodRatings: {
        pates: "like",
        banane: "like",
        yaourt: "like",
        brocoli: "dislike",
        saumon: "dislike",
      },
      allergies: [],
      forbiddenFoods: ["Poisson"],
      intolerances: [],
      consumptionHabits: { pates: "often", banane: "often" },
      dislikeLevels: { brocoli: "sometimes", saumon: "rarely" },
      preferredMeals: ["breakfast", "lunch", "snack"],
    },
  },
];

async function createDevHousehold() {
  const { createHousehold } = await import("@/lib/maison/services/households");
  const { household, member: adminMember } = await createHousehold({
    name: "Foyer Démo Dev",
    adminName: DEV_PROFILES[0].name,
    adminPin: DEV_ADMIN_PIN,
    budgetMonthly: 520,
  });

  const db = (await import("@/lib/maison/supabase/server")).getMaisonDb();
  await db
    .from("households")
    .update({
      household_key: DEV_HOUSEHOLD_KEY,
      onboarding_completed: true,
    })
    .eq("id", household.id);

  await saveMemberFoodProfile(adminMember.id, DEV_PROFILES[0].profile);

  for (const extra of DEV_PROFILES.slice(1)) {
    const m = await createMember(household.id, {
      name: extra.name,
      pin: "1234",
      role: extra.role,
    });
    await saveMemberFoodProfile(m.id, extra.profile);
  }

  await connectGroceryProvider(household.id, "leclerc_drive", "mock");

  const plan = await generateWeekMeals(household.id);
  await generateGroceryList(household.id, plan);
  await syncBudgetForWeek(household.id);

  return household.id;
}

export async function enterDevModeAction(): Promise<{ householdId: string; memberId: string }> {
  let household = await getHouseholdByKey(DEV_HOUSEHOLD_KEY);

  if (!household) {
    await createDevHousehold();
    household = await getHouseholdByKey(DEV_HOUSEHOLD_KEY);
    if (!household) throw new Error("Impossible de créer le foyer démo.");
  }

  const members = await getHouseholdMembers(household.id);
  const admin = members.find((m) => m.role === "admin") ?? members[0];
  if (!admin) throw new Error("Aucun membre dans le foyer démo.");

  await setMaisonSessionCookie(household.id, admin.id);

  return { householdId: household.id, memberId: admin.id };
}
