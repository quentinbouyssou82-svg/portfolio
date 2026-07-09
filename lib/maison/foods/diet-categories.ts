import { FOOD_BY_ID, FOOD_CATEGORIES_ORDER } from "@/lib/maison/foods/catalog";
import type {
  ConsumptionFrequency,
  DietType,
  FoodCategory,
  FoodRating,
  MemberFoodProfile,
} from "@/lib/maison/foods/types";

/** Catégories visibles selon le régime alimentaire du membre */
export function categoriesForDiet(dietType: DietType): FoodCategory[] {
  if (dietType === "vegetarian") {
    return FOOD_CATEGORIES_ORDER.filter((c) => c !== "viandes" && c !== "poissons");
  }
  if (dietType === "vegan") {
    return FOOD_CATEGORIES_ORDER.filter(
      (c) => c !== "viandes" && c !== "poissons" && c !== "produits_laitiers",
    );
  }
  if (dietType === "pescetarian") {
    return FOOD_CATEGORIES_ORDER.filter((c) => c !== "viandes");
  }
  return [...FOOD_CATEGORIES_ORDER];
}

export function isCategoryAllowedForDiet(category: FoodCategory, dietType: DietType): boolean {
  return categoriesForDiet(dietType).includes(category);
}

export function defaultCategoryForDiet(dietType: DietType): FoodCategory {
  return categoriesForDiet(dietType)[0] ?? "legumes";
}

export function isFoodAllowedForDiet(foodId: string, dietType: DietType): boolean {
  const food = FOOD_BY_ID[foodId];
  if (!food) return false;
  return isCategoryAllowedForDiet(food.category, dietType);
}

/**
 * Retire ratings et fréquences sur aliments incompatibles avec le régime.
 * Migration douce : les profils existants sont nettoyés à la lecture / sauvegarde.
 */
export function sanitizeFoodRatingsForDiet(profile: MemberFoodProfile): MemberFoodProfile {
  const foodRatings: Record<string, FoodRating> = {};
  const consumptionHabits: Record<string, ConsumptionFrequency> = {};
  const dislikeLevels: Record<string, ConsumptionFrequency> = {};

  for (const [foodId, rating] of Object.entries(profile.foodRatings)) {
    if (isFoodAllowedForDiet(foodId, profile.dietType)) {
      foodRatings[foodId] = rating;
    }
  }

  for (const [foodId, freq] of Object.entries(profile.consumptionHabits)) {
    if (isFoodAllowedForDiet(foodId, profile.dietType)) {
      consumptionHabits[foodId] = freq;
    }
  }

  for (const [foodId, level] of Object.entries(profile.dislikeLevels)) {
    if (isFoodAllowedForDiet(foodId, profile.dietType)) {
      dislikeLevels[foodId] = level;
    }
  }

  return {
    ...profile,
    foodRatings,
    consumptionHabits,
    dislikeLevels,
  };
}

/** Contraintes régime pour le prompt IA (par membre) */
export function describeDietRestrictions(dietType: DietType): string {
  switch (dietType) {
    case "vegetarian":
      return "aucune viande ni poisson — repas strictement végétariens";
    case "vegan":
      return "aucune viande, poisson ni produit laitier (lait, fromage, œufs, yaourt…) — repas 100 % vegan";
    case "pescetarian":
      return "aucune viande — poisson et fruits de mer autorisés";
    case "flexitarian":
      return "privilégier le végétal — viande occasionnelle au maximum";
    default:
      return "omnivore — pas de restriction de régime";
  }
}

export function buildHouseholdDietConstraints(
  members: Array<{ name: string; diet_type: string }>,
): string {
  if (members.length === 0) return "";

  const lines = members.map(
    (m) =>
      `- ${m.name} : ${describeDietRestrictions((m.diet_type as DietType) ?? "omnivore")}`,
  );

  return `RÉGIMES ALIMENTAIRES (obligatoires — adapter chaque repas aux membres présents) :\n${lines.join("\n")}`;
}
