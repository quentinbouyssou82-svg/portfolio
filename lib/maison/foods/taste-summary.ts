import { FOOD_BY_ID } from "@/lib/maison/foods/catalog";
import { describeDietRestrictions } from "@/lib/maison/foods/diet-categories";
import {
  DIET_OPTIONS,
  DISLIKE_FREQUENCY_OPTIONS,
  FREQUENCY_OPTIONS,
  MEAL_SLOT_OPTIONS,
  type ConsumptionFrequency,
  type FoodRating,
  type MemberFoodProfile,
} from "@/lib/maison/foods/types";

const DIET_LABELS = Object.fromEntries(DIET_OPTIONS.map((d) => [d.id, d.label])) as Record<
  string,
  string
>;

const FREQ_LABELS = Object.fromEntries(FREQUENCY_OPTIONS.map((f) => [f.id, f.label])) as Record<
  ConsumptionFrequency,
  string
>;

const DISLIKE_LABELS = Object.fromEntries(
  DISLIKE_FREQUENCY_OPTIONS.map((f) => [f.id, f.label]),
) as Record<ConsumptionFrequency, string>;

const MEAL_LABELS = Object.fromEntries(MEAL_SLOT_OPTIONS.map((m) => [m.id, m.label])) as Record<
  string,
  string
>;

function foodLabel(foodId: string): string {
  return FOOD_BY_ID[foodId]?.name ?? foodId;
}

function formatRatedFoods(
  ratings: Record<string, FoodRating>,
  habits: Record<string, ConsumptionFrequency>,
  rating: FoodRating,
  freqLabels: Record<ConsumptionFrequency, string> = FREQ_LABELS,
): string[] {
  return Object.entries(ratings)
    .filter(([, value]) => value === rating)
    .map(([id]) => {
      const freq = habits[id];
      const freqLabel = freq ? ` — ${freqLabels[freq] ?? freq}` : "";
      return `${foodLabel(id)}${freqLabel}`;
    });
}

/** Texte structuré injecté dans le prompt IA pour un membre */
export function buildTasteSummaryForAI(profile: MemberFoodProfile): string {
  const lines: string[] = [];

  lines.push(
    `Régime : ${DIET_LABELS[profile.dietType] ?? profile.dietType} — ${describeDietRestrictions(profile.dietType)}`,
  );

  const mealSlots = profile.preferredMeals
    .map((id) => MEAL_LABELS[id] ?? id)
    .join(", ");
  if (mealSlots) {
    lines.push(`Créneaux repas habituels : ${mealSlots}`);
  }

  const likesOften = Object.entries(profile.consumptionHabits)
    .filter(([, freq]) => freq === "often")
    .map(([id]) => foodLabel(id));
  if (likesOften.length) {
    lines.push(`À cuisiner souvent : ${likesOften.join(", ")}`);
  }

  const likes = formatRatedFoods(profile.foodRatings, profile.consumptionHabits, "like");
  if (likes.length) {
    lines.push(`Aime : ${likes.join("; ")}`);
  }

  const dislikes = formatRatedFoods(profile.foodRatings, profile.dislikeLevels, "dislike", DISLIKE_LABELS);
  if (dislikes.length) {
    lines.push(`N'aime pas : ${dislikes.join(", ")}`);
  }

  if (profile.allergies.length) {
    lines.push(`Allergies : ${profile.allergies.join(", ")}`);
  }
  if (profile.intolerances.length) {
    lines.push(`Intolérances : ${profile.intolerances.join(", ")}`);
  }
  if (profile.forbiddenFoods.length) {
    lines.push(`Aliments interdits : ${profile.forbiddenFoods.join(", ")}`);
  }

  return lines.join("\n");
}
