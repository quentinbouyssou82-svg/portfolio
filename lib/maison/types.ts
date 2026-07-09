import type { ConsumptionFrequency, FoodRating } from "@/lib/maison/foods/types";

export type MemberRole = "admin" | "member";

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export type NutritionGoal = "weight_loss" | "maintain" | "light_gain";

export type GroceryCategory =
  | "fruits"
  | "legumes"
  | "viande"
  | "poisson"
  | "produits_laitiers"
  | "epicerie"
  | "surgeles"
  | "boissons";

export type GroceryListStatus = "draft" | "finalized" | "exported";

export type GroceryProviderId = "leclerc_drive" | "netto" | "other";

export interface GroceryIntegration {
  provider: GroceryProviderId;
  status: "disconnected" | "connected_mock" | "connected" | "manual";
  storeId?: string;
  connectedAt?: string;
  accountLabel?: string;
  /** oauth = API partenaire, external = retour depuis page login enseigne */
  oauthMode?: "oauth" | "external" | "mock" | "manual";
}

/** @deprecated Use GroceryIntegration */
export type LeclercIntegration = GroceryIntegration;

export interface HouseholdGlobalSettings {
  grocery_provider?: GroceryIntegration;
  /** @deprecated Read via getGroceryIntegration — legacy key */
  leclerc?: GroceryIntegration;
  goals?: string[];
}

export interface Household {
  id: string;
  name: string;
  household_key: string;
  budget_monthly: number;
  onboarding_completed: boolean;
  global_settings: HouseholdGlobalSettings & Record<string, unknown>;
  created_at: string;
}

export interface Member {
  id: string;
  household_id: string;
  name: string;
  role: MemberRole;
  goals: string | null;
  activity_level: string;
  portion_factor: number;
  days_at_home: number[];
  created_at: string;
}

export interface Preferences {
  id: string;
  member_id: string;
  liked_foods: string[];
  disliked_foods: string[];
  allergies: string[];
  must_have_foods: string[];
  forbidden_foods: string[];
  intolerances: string[];
  nutrition_goal: NutritionGoal;
  diet_type: string;
  food_ratings: Record<string, FoodRating>;
  consumption_habits: Record<string, ConsumptionFrequency>;
  dislike_levels: Record<string, ConsumptionFrequency>;
  preferred_meals: string[];
  taste_completed_at?: string | null;
  updated_at: string;
}

export interface MemberWithPreferences extends Member {
  preferences: Preferences | null;
}

export interface MealIngredient {
  name: string;
  quantity: string;
  unit?: string;
  category: GroceryCategory;
  pricePerUnit?: number;
}

export interface Meal {
  id: string;
  day_date: string;
  meal_type: MealType;
  title: string;
  description?: string;
  image_url?: string;
  calories_est: number;
  protein_est: number;
  carbs_est: number;
  fat_est: number;
  cost_est: number;
  ingredients: MealIngredient[];
  is_common: boolean;
  member_adjustments: Record<string, string>;
}

export interface MealPlan {
  id: string;
  household_id: string;
  week_start: string;
  week_end: string;
  data: { meals: Meal[] };
  created_at: string;
}

export interface GroceryItem {
  id: string;
  name: string;
  quantity: string;
  unit: string | null;
  category: GroceryCategory;
  price_est: number;
  checked: boolean;
}

export interface GroceryList {
  id: string;
  household_id: string;
  meal_plan_id: string | null;
  items: { items: GroceryItem[]; total_estimated: number };
  status: GroceryListStatus;
  created_at: string;
}

export interface Budget {
  id: string;
  household_id: string;
  week_start: string;
  estimated_cost: number;
  actual_cost: number;
  created_at: string;
}

export interface NutritionInsight {
  label: string;
  value: number;
  note: string;
  type: "variety" | "protein" | "vegetables" | "processed" | "calories";
}

export interface NutritionAnalysis {
  scores: NutritionInsight[];
  recommendations: string[];
  weeklyCalories: number;
  weeklyProtein: number;
  weeklyCarbs: number;
  weeklyFat: number;
  uniqueIngredients: number;
}

export interface GroceryExportPayload {
  merchant: "leclerc_drive";
  generatedAt: string;
  householdName: string;
  items: Array<{
    name: string;
    quantity: number;
    unit: string;
  }>;
}

export interface MaisonSessionContext {
  householdId: string;
  memberId: string;
  role: MemberRole;
  household: Household;
  member: MemberWithPreferences;
}

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; message: string };

/** Budget hebdomadaire dérivé du budget mensuel foyer */
export function weeklyBudgetFromMonthly(budgetMonthly: number): number {
  return Math.round((budgetMonthly / 4.33) * 100) / 100;
}
