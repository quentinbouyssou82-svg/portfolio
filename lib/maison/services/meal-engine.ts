import { generateQwenJson, isQwenAvailable } from "@/lib/ai/qwen";
import { MealGenerationError } from "@/lib/maison/errors";
import { DAY_LABELS } from "@/lib/maison/constants";
import { buildHouseholdDietConstraints } from "@/lib/maison/foods/diet-categories";
import { getHousehold } from "@/lib/maison/services/households";
import {
  getHouseholdMembers,
  toMealMemberProfile,
  type MealMemberProfile,
} from "@/lib/maison/services/members";
import type { GroceryCategory, Household, Meal, MealType } from "@/lib/maison/types";
import { weeklyBudgetFromMonthly } from "@/lib/maison/types";
import { addDays, getWeekStart } from "@/lib/maison/utils/date";
import {
  buildValidationRetryHint,
  collectForbiddenTerms,
  mealViolatesPreferences,
  validateMealPlan,
} from "@/lib/maison/services/meal-validation";

const MAX_PLAN_ATTEMPTS = 2;

const MEAL_SLOTS: MealType[] = ["breakfast", "lunch", "dinner"];
const GROCERY_CATEGORIES: GroceryCategory[] = [
  "fruits",
  "legumes",
  "viande",
  "poisson",
  "produits_laitiers",
  "epicerie",
  "surgeles",
  "boissons",
];

export interface MealEngineAlternative {
  day_date: string;
  meal_type: MealType;
  suggestions: string[];
}

export interface MealEngineResult {
  meals: Meal[];
  alternatives: MealEngineAlternative[];
}

interface RawMealIngredient {
  name?: string;
  quantity?: string;
  unit?: string;
  category?: string;
}

interface RawMeal {
  day_date?: string;
  meal_type?: string;
  title?: string;
  description?: string;
  calories_est?: number;
  protein_est?: number;
  carbs_est?: number;
  fat_est?: number;
  cost_est?: number;
  ingredients?: RawMealIngredient[];
  is_common?: boolean;
  member_adjustments?: Record<string, string>;
}

interface RawAlternative {
  day_date?: string;
  meal_type?: string;
  suggestions?: string[];
}

interface RawMealPlanResponse {
  meals?: RawMeal[];
  alternatives?: RawAlternative[];
}

export interface MealEngineContext {
  household: Household;
  members: MealMemberProfile[];
  weekStart: string;
  weekEnd: string;
  weeklyBudget: number;
}

function newMealId(): string {
  return crypto.randomUUID();
}

function normalizeMealType(value: string | undefined): MealType | null {
  const v = (value ?? "").toLowerCase().trim();
  if (v === "breakfast" || v === "petit-dejeuner" || v === "petit_dejeuner") return "breakfast";
  if (v === "lunch" || v === "dejeuner" || v === "déjeuner") return "lunch";
  if (v === "dinner" || v === "diner" || v === "dîner") return "dinner";
  if (v === "snack" || v === "gouter" || v === "goûter") return "snack";
  if (MEAL_SLOTS.includes(v as MealType) || v === "snack") return v as MealType;
  return null;
}

function normalizeCategory(value: string | undefined): GroceryCategory {
  const v = (value ?? "epicerie").toLowerCase().replace(/\s+/g, "_");
  if (GROCERY_CATEGORIES.includes(v as GroceryCategory)) return v as GroceryCategory;
  if (v.includes("fruit")) return "fruits";
  if (v.includes("legume") || v.includes("légume")) return "legumes";
  if (v.includes("viande") || v.includes("porc") || v.includes("boeuf")) return "viande";
  if (v.includes("poisson") || v.includes("saumon")) return "poisson";
  if (v.includes("lait") || v.includes("fromage")) return "produits_laitiers";
  if (v.includes("surgele")) return "surgeles";
  if (v.includes("boisson")) return "boissons";
  return "epicerie";
}

function num(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function buildWeekDays(weekStart: string): Array<{ index: number; date: string; label: string }> {
  return DAY_LABELS.map((label, index) => ({
    index,
    label,
    date: addDays(weekStart, index),
  }));
}

function buildMemberSummary(members: MealMemberProfile[]): string {
  return members
    .map((m) => {
      const home =
        m.home_days.length === 7
          ? "tous les jours"
          : m.home_days.map((d) => DAY_LABELS[d] ?? `jour ${d}`).join(", ");
      return [
        `- ${m.name} (id: ${m.id})`,
        `  objectif nutrition : ${m.nutrition_goal}`,
        `  portions : ${m.portion_preference}`,
        `  présent : ${home}`,
        `  PROFIL GUSTATIF :`,
        ...m.taste_summary.split("\n").map((line) => `    ${line}`),
        m.liked_foods.length
          ? `  (résumé rapide — aime : ${m.liked_foods.join(", ")})`
          : "",
        m.disliked_foods.length
          ? `  (résumé rapide — éviter : ${m.disliked_foods.join(", ")})`
          : "",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");
}

function buildPreferenceConstraints(ctx: MealEngineContext): string {
  const forbidden = collectForbiddenTerms(ctx.members);
  const mustHave = [
    ...new Set(ctx.members.flatMap((m) => m.must_have_foods.map((f) => f.trim())).filter(Boolean)),
  ];
  const dietBlock = buildHouseholdDietConstraints(ctx.members);

  return [
    dietBlock,
    forbidden.length
      ? `INTERDITS ABSOLUS (aucun repas ne doit les contenir) : ${forbidden.join(", ")}`
      : "Aucune allergie ni aliment interdit déclaré.",
    mustHave.length
      ? `À intégrer dans la semaine si possible : ${mustHave.join(", ")}`
      : "",
    `Budget hebdomadaire total des repas : environ ${ctx.weeklyBudget.toFixed(0)} €`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

function buildMealPlanPrompt(
  ctx: MealEngineContext,
  options?: { singleMeal?: Meal; retryHint?: string },
): string {
  const days = buildWeekDays(ctx.weekStart);
  const daysBlock = days.map((d) => `${d.label} (${d.date})`).join(", ");
  const membersBlock = buildMemberSummary(ctx.members);
  const hasChildren = ctx.members.some((m) => /\d+\s*ans/i.test(m.family_role));

  const constraintsBlock = buildPreferenceConstraints(ctx);

  const singleBlock = options?.singleMeal
    ? `
Génère UN SEUL repas de remplacement pour :
- date : ${options.singleMeal.day_date}
- type : ${options.singleMeal.meal_type}
- titre actuel à remplacer : ${options.singleMeal.title}
Le JSON doit contenir exactement 1 repas dans "meals" (plus des alternatives pour ce repas).
`
    : `
Génère un planning complet pour 7 jours (lundi → dimanche).
Pour chaque jour : petit-déjeuner, déjeuner, dîner.
${hasChildren ? "Ajoute un goûter (snack) les jours où des enfants sont présents." : ""}
`;

  return `Tu es un nutritionniste culinaire français. Réponds UNIQUEMENT en JSON valide, sans texte autour.

FOYER : ${ctx.household.name}
Budget hebdomadaire estimé : ${ctx.weeklyBudget.toFixed(0)} €
Semaine : ${ctx.weekStart} → ${ctx.weekEnd}
Jours : ${daysBlock}

MEMBRES :
${membersBlock}

CONTRAINTES ALIMENTAIRES :
${constraintsBlock}
${options?.retryHint ?? ""}

RÈGLES :
1. Respecter strictement allergies, aliments interdits et RÉGIMES ALIMENTAIRES de chaque membre.
2. Repas familiaux communs : compatibles avec le régime le plus restrictif des membres présents (ex. si un végétarien mange → repas sans viande ni poisson).
3. Petit-déjeuner : repas souvent individuels (is_common: false) avec member_adjustments par membre présent ce jour-là.
4. Déjeuner et dîner : repas familiaux communs (is_common: true) adaptés à tous les présents.
5. Varier les protéines, légumes et féculents sur la semaine.
6. Optimiser légèrement les apports selon les objectifs nutritionnels.
7. Rester dans le budget hebdomadaire (cost_est en euros par repas).
8. Ingrédients réalistes pour courses en supermarché français.
${singleBlock}

FORMAT JSON EXACT :
{
  "meals": [
    {
      "day_date": "YYYY-MM-DD",
      "meal_type": "breakfast|lunch|dinner|snack",
      "title": "string",
      "description": "string courte",
      "calories_est": number,
      "protein_est": number,
      "carbs_est": number,
      "fat_est": number,
      "cost_est": number,
      "ingredients": [
        { "name": "string", "quantity": "string", "unit": "string", "category": "fruits|legumes|viande|poisson|produits_laitiers|epicerie|surgeles|boissons" }
      ],
      "is_common": boolean,
      "member_adjustments": { "member_id": "variante courte si petit-déjeuner individuel" }
    }
  ],
  "alternatives": [
    {
      "day_date": "YYYY-MM-DD",
      "meal_type": "breakfast|lunch|dinner|snack",
      "suggestions": ["alternative 1", "alternative 2"]
    }
  ]
}`;
}

function rawToMeal(raw: RawMeal, members: MealMemberProfile[]): Meal | null {
  const mealType = normalizeMealType(raw.meal_type);
  if (!mealType || !raw.day_date || !raw.title?.trim()) return null;

  const adjustments: Record<string, string> = {};
  if (raw.member_adjustments && typeof raw.member_adjustments === "object") {
    for (const [key, value] of Object.entries(raw.member_adjustments)) {
      if (typeof value === "string" && value.trim()) adjustments[key] = value.trim();
    }
  }

  const isCommon =
    typeof raw.is_common === "boolean"
      ? raw.is_common
      : mealType === "lunch" || mealType === "dinner";

  if (!isCommon && mealType === "breakfast" && Object.keys(adjustments).length === 0) {
    for (const m of members) {
      adjustments[m.id] = raw.title.trim();
    }
  }

  return {
    id: newMealId(),
    day_date: raw.day_date,
    meal_type: mealType,
    title: raw.title.trim(),
    description: raw.description?.trim() || undefined,
    calories_est: num(raw.calories_est, 400),
    protein_est: num(raw.protein_est, 15),
    carbs_est: num(raw.carbs_est, 45),
    fat_est: num(raw.fat_est, 12),
    cost_est: num(raw.cost_est, 5),
    ingredients: (raw.ingredients ?? []).map((i) => ({
      name: i.name?.trim() || "Ingrédient",
      quantity: i.quantity?.trim() || "1",
      unit: i.unit?.trim() || undefined,
      category: normalizeCategory(i.category),
    })),
    is_common: isCommon,
    member_adjustments: adjustments,
  };
}

function parseMealPlanResponse(
  raw: RawMealPlanResponse,
  ctx: MealEngineContext,
): MealEngineResult {
  const meals: Meal[] = [];
  for (const item of raw.meals ?? []) {
    const meal = rawToMeal(item, ctx.members);
    if (meal) meals.push(meal);
  }

  if (meals.length === 0) {
    throw new MealGenerationError("L'IA n'a généré aucun repas valide.", "empty");
  }

  const alternatives: MealEngineAlternative[] = (raw.alternatives ?? [])
    .map((alt) => {
      const mealType = normalizeMealType(alt.meal_type);
      if (!mealType || !alt.day_date) return null;
      const suggestions = (alt.suggestions ?? []).filter((s) => typeof s === "string" && s.trim());
      if (suggestions.length === 0) return null;
      return {
        day_date: alt.day_date,
        meal_type: mealType,
        suggestions,
      };
    })
    .filter((a): a is MealEngineAlternative => a !== null);

  return { meals, alternatives };
}

export async function buildMealEngineContext(
  householdId: string,
  weekStart: string,
): Promise<MealEngineContext> {
  const household = await getHousehold(householdId);
  if (!household) throw new Error("Foyer introuvable.");

  const membersRaw = await getHouseholdMembers(householdId);
  const members = membersRaw.map(toMealMemberProfile);
  if (members.length === 0) {
    throw new Error("Ajoutez au moins un membre au foyer.");
  }

  return {
    household,
    members,
    weekStart,
    weekEnd: addDays(weekStart, 6),
    weeklyBudget: weeklyBudgetFromMonthly(household.budget_monthly),
  };
}

export async function generateWeekMealPlan(
  householdId: string,
  weekStart: string,
): Promise<MealEngineResult> {
  if (!(await isQwenAvailable())) {
    throw new MealGenerationError(
      "Ollama n'est pas disponible. Vérifiez qu'il tourne sur votre machine (ollama run qwen2.5-coder).",
      "ai_unavailable",
    );
  }

  const ctx = await buildMealEngineContext(householdId, weekStart);
  let retryHint: string | undefined;

  for (let attempt = 0; attempt < MAX_PLAN_ATTEMPTS; attempt++) {
    const prompt = buildMealPlanPrompt(ctx, { retryHint });
    const raw = await generateQwenJson<RawMealPlanResponse>(prompt, { maxRetries: 1 });
    const parsed = parseMealPlanResponse(raw, ctx);
    const validation = validateMealPlan(parsed.meals, ctx.members, ctx.weekStart);

    if (validation.valid) {
      return parsed;
    }

    if (attempt < MAX_PLAN_ATTEMPTS - 1) {
      retryHint = buildValidationRetryHint(validation.issues);
      continue;
    }

    throw new MealGenerationError(
      `Planning non conforme aux préférences : ${validation.issues.slice(0, 3).join(" · ")}`,
      "validation",
    );
  }

  throw new MealGenerationError("Impossible de générer un planning valide.", "unknown");
}

export async function regenerateMealWithAI(
  householdId: string,
  existingMeal: Meal,
): Promise<MealEngineResult> {
  const weekStart = getWeekStart(new Date(existingMeal.day_date + "T12:00:00"));
  const ctx = await buildMealEngineContext(householdId, weekStart);
  const prompt = buildMealPlanPrompt(ctx, { singleMeal: existingMeal });
  const raw = await generateQwenJson<RawMealPlanResponse>(prompt);
  const parsed = parseMealPlanResponse(raw, ctx);

  const replacement =
    parsed.meals.find(
      (m) => m.meal_type === existingMeal.meal_type && m.day_date === existingMeal.day_date,
    ) ?? parsed.meals[0];

  if (!replacement) {
    throw new MealGenerationError("L'IA n'a pas proposé de repas de remplacement.", "empty");
  }

  const violation = mealViolatesPreferences(
    { ...replacement, id: existingMeal.id },
    ctx.members,
  );
  if (violation) {
    throw new MealGenerationError(violation, "validation");
  }

  return {
    meals: [{ ...replacement, id: existingMeal.id, day_date: existingMeal.day_date }],
    alternatives: parsed.alternatives.filter(
      (a) => a.day_date === existingMeal.day_date && a.meal_type === existingMeal.meal_type,
    ),
  };
}
