import { FOOD_BY_ID } from "@/lib/maison/foods/catalog";
import { sanitizeFoodRatingsForDiet } from "@/lib/maison/foods/diet-categories";
import {
  DIET_OPTIONS,
  FREQUENCY_OPTIONS,
  MEAL_SLOT_OPTIONS,
  type ConsumptionFrequency,
  type DietType,
  type FoodRating,
  type MemberFoodProfile,
} from "@/lib/maison/foods/types";
import type { Preferences } from "@/lib/maison/types";

const VALID_RATINGS = new Set<FoodRating>(["like", "neutral", "dislike"]);
const VALID_FREQUENCIES = new Set<ConsumptionFrequency>(["often", "sometimes", "rarely"]);
const VALID_DIETS = new Set(DIET_OPTIONS.map((d) => d.id));
const VALID_MEAL_SLOTS = new Set(MEAL_SLOT_OPTIONS.map((m) => m.id));

export function syncRatingsToFoodArrays(
  foodRatings: Record<string, FoodRating>,
): { liked_foods: string[]; disliked_foods: string[] } {
  const liked: string[] = [];
  const disliked: string[] = [];

  for (const [id, rating] of Object.entries(foodRatings)) {
    const item = FOOD_BY_ID[id];
    if (!item) continue;
    if (rating === "like") liked.push(item.name);
    if (rating === "dislike") disliked.push(item.name);
  }

  return { liked_foods: liked, disliked_foods: disliked };
}

export function emptyMemberFoodProfile(): MemberFoodProfile {
  return {
    dietType: "omnivore",
    foodRatings: {},
    allergies: [],
    forbiddenFoods: [],
    intolerances: [],
    consumptionHabits: {},
    dislikeLevels: {},
    preferredMeals: ["lunch", "dinner"],
  };
}

export function preferencesToFoodProfile(prefs: Preferences | null): MemberFoodProfile {
  if (!prefs) return emptyMemberFoodProfile();

  const p = prefs as Preferences & {
    diet_type?: string;
    forbidden_foods?: string[];
    intolerances?: string[];
    food_ratings?: Record<string, FoodRating>;
    consumption_habits?: Record<string, ConsumptionFrequency>;
    dislike_levels?: Record<string, ConsumptionFrequency>;
    preferred_meals?: string[];
  };

  return sanitizeFoodRatingsForDiet({
    dietType: (p.diet_type as DietType) ?? "omnivore",
    foodRatings: p.food_ratings ?? {},
    allergies: p.allergies ?? [],
    forbiddenFoods: p.forbidden_foods ?? [],
    intolerances: p.intolerances ?? [],
    consumptionHabits: p.consumption_habits ?? {},
    dislikeLevels: p.dislike_levels ?? {},
    preferredMeals: p.preferred_meals ?? ["lunch", "dinner"],
  });
}

export { sanitizeFoodRatingsForDiet } from "@/lib/maison/foods/diet-categories";

export function foodProfileToPreferenceUpdate(
  profile: MemberFoodProfile,
): Partial<Preferences> {
  const sanitized = sanitizeFoodRatingsForDiet(profile);
  const { liked_foods, disliked_foods } = syncRatingsToFoodArrays(sanitized.foodRatings);

  const must_have_foods = Object.entries(sanitized.consumptionHabits)
    .filter(([, freq]) => freq === "often")
    .map(([id]) => FOOD_BY_ID[id]?.name)
    .filter(Boolean) as string[];

  return {
    diet_type: sanitized.dietType,
    liked_foods,
    disliked_foods,
    allergies: sanitized.allergies,
    forbidden_foods: sanitized.forbiddenFoods,
    intolerances: sanitized.intolerances,
    food_ratings: sanitized.foodRatings,
    consumption_habits: sanitized.consumptionHabits,
    dislike_levels: sanitized.dislikeLevels,
    preferred_meals: sanitized.preferredMeals,
    must_have_foods,
  };
}

/** Pré-remplit les ratings neutres pour affichage compteur (visible foods only) */
export function countRatings(ratings: Record<string, FoodRating>) {
  let likes = 0;
  let dislikes = 0;
  let neutral = 0;
  for (const r of Object.values(ratings)) {
    if (r === "like") likes++;
    else if (r === "dislike") dislikes++;
    else neutral++;
  }
  return { likes, dislikes, neutral, total: Object.keys(ratings).length };
}

export function nextRating(current: FoodRating | undefined): FoodRating {
  if (!current || current === "neutral") return "like";
  if (current === "like") return "dislike";
  return "neutral";
}

/** Valide un profil gustatif avant persistance en base (après sanitization régime) */
export function validateMemberFoodProfile(profile: MemberFoodProfile): string | null {
  const sanitized = sanitizeFoodRatingsForDiet(profile);

  if (!VALID_DIETS.has(sanitized.dietType)) {
    return "Régime alimentaire invalide.";
  }

  for (const meal of sanitized.preferredMeals) {
    if (!VALID_MEAL_SLOTS.has(meal as (typeof MEAL_SLOT_OPTIONS)[number]["id"])) {
      return `Créneau repas invalide : ${meal}`;
    }
  }

  for (const [foodId, rating] of Object.entries(sanitized.foodRatings)) {
    if (!FOOD_BY_ID[foodId]) return `Aliment inconnu : ${foodId}`;
    if (!VALID_RATINGS.has(rating)) return `Note invalide pour ${foodId}`;
  }

  for (const [foodId, freq] of Object.entries(sanitized.consumptionHabits)) {
    if (!FOOD_BY_ID[foodId]) return `Aliment inconnu (fréquence) : ${foodId}`;
    if (!VALID_FREQUENCIES.has(freq)) return `Fréquence invalide pour ${foodId}`;
  }

  for (const [foodId, level] of Object.entries(sanitized.dislikeLevels)) {
    if (!FOOD_BY_ID[foodId]) return `Aliment inconnu (évitement) : ${foodId}`;
    if (!VALID_FREQUENCIES.has(level)) return `Niveau d'évitement invalide pour ${foodId}`;
  }

  return null;
}
