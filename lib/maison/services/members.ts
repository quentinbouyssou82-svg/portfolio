import type {
  ConsumptionFrequency,
  FoodRating,
} from "@/lib/maison/foods/types";
import type {
  Member,
  MemberWithPreferences,
  NutritionGoal,
  Preferences,
} from "@/lib/maison/types";
import { hashPin } from "@/lib/maison/env";
import { FOOD_BY_ID } from "@/lib/maison/foods/catalog";
import { preferencesToFoodProfile, syncRatingsToFoodArrays } from "@/lib/maison/foods/sync";
import { buildTasteSummaryForAI } from "@/lib/maison/foods/taste-summary";
import { getMaisonDb } from "@/lib/maison/supabase/server";

export interface MemberInput {
  name: string;
  pin: string;
  role?: "admin" | "member";
  age?: number | null;
  goals?: string;
  activity_level?: string;
  portion_factor?: number;
  days_at_home?: number[];
  liked_foods?: string[];
  disliked_foods?: string[];
  allergies?: string[];
  must_have_foods?: string[];
  nutrition_goal?: NutritionGoal;
}

export async function getHouseholdMembers(
  householdId: string,
): Promise<MemberWithPreferences[]> {
  const { data: members, error } = await getMaisonDb()
    .from("members")
    .select("*")
    .eq("household_id", householdId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  const result: MemberWithPreferences[] = [];
  for (const m of members ?? []) {
    const { data: prefs } = await getMaisonDb()
      .from("preferences")
      .select("*")
      .eq("member_id", m.id)
      .maybeSingle();

    result.push({
      ...(m as Member),
      preferences: (prefs as Preferences) ?? null,
    });
  }
  return result;
}

export async function createMember(
  householdId: string,
  input: MemberInput,
): Promise<MemberWithPreferences> {
  const pinHash = await hashPin(input.pin, householdId);

  const { data: member, error } = await getMaisonDb()
    .from("members")
    .insert({
      household_id: householdId,
      name: input.name.trim(),
      role: input.role ?? "member",
      pin_hash: pinHash,
      goals: input.age ? `${input.age} ans` : input.goals ?? null,
      activity_level: input.activity_level ?? "moderate",
      portion_factor: input.portion_factor ?? 1,
      days_at_home: input.days_at_home ?? [0, 1, 2, 3, 4, 5, 6],
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  const { data: prefs, error: pErr } = await getMaisonDb()
    .from("preferences")
    .insert({
      member_id: member.id,
      liked_foods: input.liked_foods ?? [],
      disliked_foods: input.disliked_foods ?? [],
      allergies: input.allergies ?? [],
      must_have_foods: input.must_have_foods ?? [],
      nutrition_goal: input.nutrition_goal ?? "maintain",
      diet_type: "omnivore",
      forbidden_foods: [],
      intolerances: [],
      food_ratings: {},
      consumption_habits: {},
      dislike_levels: {},
      preferred_meals: ["lunch", "dinner"],
    })
    .select("*")
    .single();

  if (pErr) throw new Error(pErr.message);

  return { ...(member as Member), preferences: prefs as Preferences };
}

export async function updateMemberFull(
  householdId: string,
  memberId: string,
  input: Partial<MemberInput & { role?: "admin" | "member" }>,
): Promise<void> {
  const memberUpdate: Record<string, unknown> = {};
  if (input.name) memberUpdate.name = input.name.trim();
  if (input.role) memberUpdate.role = input.role;
  if (input.activity_level) memberUpdate.activity_level = input.activity_level;
  if (input.portion_factor !== undefined) memberUpdate.portion_factor = input.portion_factor;
  if (input.days_at_home) memberUpdate.days_at_home = input.days_at_home;

  if (input.age !== undefined) {
    memberUpdate.goals = input.age ? `${input.age} ans` : input.goals ?? null;
  } else if (input.goals !== undefined) {
    memberUpdate.goals = input.goals;
  }

  if (input.pin) {
    memberUpdate.pin_hash = await hashPin(input.pin, householdId);
  }

  if (Object.keys(memberUpdate).length > 0) {
    const { error } = await getMaisonDb()
      .from("members")
      .update(memberUpdate)
      .eq("id", memberId);
    if (error) throw new Error(error.message);
  }

  const prefFields = {
    liked_foods: input.liked_foods,
    disliked_foods: input.disliked_foods,
    allergies: input.allergies,
    must_have_foods: input.must_have_foods,
    nutrition_goal: input.nutrition_goal,
  };
  const hasPrefs = Object.values(prefFields).some((v) => v !== undefined);
  if (hasPrefs) {
    await updateMemberPreferences(memberId, prefFields);
  }
}

export async function updateMemberExtendedPreferences(
  memberId: string,
  input: Partial<
    Pick<
      Preferences,
      | "liked_foods"
      | "disliked_foods"
      | "allergies"
      | "must_have_foods"
      | "nutrition_goal"
      | "diet_type"
      | "forbidden_foods"
      | "intolerances"
      | "food_ratings"
      | "consumption_habits"
      | "preferred_meals"
    >
  >,
): Promise<void> {
  if (Object.keys(input).length === 0) return;

  const { error } = await getMaisonDb()
    .from("preferences")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("member_id", memberId);

  if (error) throw new Error(error.message);
}

export async function updateMemberPreferences(
  memberId: string,
  input: Partial<{
    name: string;
    goals: string;
    activity_level: string;
    portion_factor: number;
    days_at_home: number[];
    liked_foods: string[];
    disliked_foods: string[];
    allergies: string[];
    must_have_foods: string[];
    nutrition_goal: NutritionGoal;
    diet_type: string;
    forbidden_foods: string[];
    intolerances: string[];
    food_ratings: Record<string, FoodRating>;
    consumption_habits: Record<string, ConsumptionFrequency>;
    preferred_meals: string[];
  }>,
): Promise<void> {
  const { name, goals, activity_level, portion_factor, days_at_home, ...prefFields } = input;

  if (name || goals || activity_level || portion_factor !== undefined || days_at_home) {
    const memberUpdate: Record<string, unknown> = {};
    if (name) memberUpdate.name = name;
    if (goals !== undefined) memberUpdate.goals = goals;
    if (activity_level) memberUpdate.activity_level = activity_level;
    if (portion_factor !== undefined) memberUpdate.portion_factor = portion_factor;
    if (days_at_home) memberUpdate.days_at_home = days_at_home;

    const { error } = await getMaisonDb()
      .from("members")
      .update(memberUpdate)
      .eq("id", memberId);

    if (error) throw new Error(error.message);
  }

  if (Object.keys(prefFields).length > 0) {
    const { error } = await getMaisonDb()
      .from("preferences")
      .update({ ...prefFields, updated_at: new Date().toISOString() })
      .eq("member_id", memberId);

    if (error) throw new Error(error.message);
  }
}

export async function deleteMember(memberId: string): Promise<void> {
  const { error } = await getMaisonDb().from("members").delete().eq("id", memberId);
  if (error) throw new Error(error.message);
}

/** Membre enrichi pour la génération de repas */
export interface MealMemberProfile {
  id: string;
  name: string;
  family_role: string;
  diet_type: string;
  liked_foods: string[];
  disliked_foods: string[];
  allergies: string[];
  must_have_foods: string[];
  nutrition_goal: string;
  portion_preference: string;
  home_days: number[];
  /** Notes par aliment (id catalogue) — source de vérité pour l'IA */
  food_ratings: Record<string, FoodRating>;
  /** Fréquence de consommation par aliment */
  consumption_habits: Record<string, ConsumptionFrequency>;
  /** Créneaux repas préférés (breakfast, lunch, …) */
  preferred_meals: string[];
  forbidden_foods: string[];
  intolerances: string[];
  taste_summary: string;
}

export function toMealMemberProfile(m: MemberWithPreferences): MealMemberProfile {
  const prefs = m.preferences;
  const goal = prefs?.nutrition_goal ?? "maintain";
  const portion =
    m.portion_factor < 0.85 ? "small" : m.portion_factor > 1.15 ? "large" : "normal";

  const forbiddenFoods = prefs?.forbidden_foods ?? [];
  const intolerances = prefs?.intolerances ?? [];
  const tasteProfile = preferencesToFoodProfile(prefs);
  const { liked_foods, disliked_foods } = syncRatingsToFoodArrays(tasteProfile.foodRatings);
  const must_have_foods = Object.entries(tasteProfile.consumptionHabits)
    .filter(([, freq]) => freq === "often")
    .map(([id]) => FOOD_BY_ID[id]?.name)
    .filter(Boolean) as string[];

  return {
    id: m.id,
    name: m.name,
    family_role: m.role === "admin" ? "Admin" : "Membre",
    diet_type: tasteProfile.dietType,
    liked_foods,
    disliked_foods: [...disliked_foods, ...forbiddenFoods],
    allergies: [...(prefs?.allergies ?? []), ...intolerances],
    must_have_foods,
    nutrition_goal: goal,
    portion_preference: portion,
    home_days: Array.isArray(m.days_at_home) ? m.days_at_home : [0, 1, 2, 3, 4, 5, 6],
    food_ratings: tasteProfile.foodRatings,
    consumption_habits: tasteProfile.consumptionHabits,
    preferred_meals: tasteProfile.preferredMeals,
    forbidden_foods: forbiddenFoods,
    intolerances,
    taste_summary: buildTasteSummaryForAI(tasteProfile),
  };
}
