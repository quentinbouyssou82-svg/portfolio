import { NextResponse } from "next/server";
import { foodsByCategory } from "@/lib/maison/foods/catalog";
import {
  categoriesForDiet,
  defaultCategoryForDiet,
} from "@/lib/maison/foods/diet-categories";
import {
  DIET_OPTIONS,
  FOOD_CATEGORY_LABELS,
  type DietType,
} from "@/lib/maison/foods/types";

const VALID_DIETS = new Set(DIET_OPTIONS.map((d) => d.id));

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dietParam = (searchParams.get("diet") ?? "omnivore").trim();

  if (!VALID_DIETS.has(dietParam as DietType)) {
    return NextResponse.json(
      {
        error: "Régime invalide",
        validDiets: DIET_OPTIONS.map((d) => d.id),
      },
      { status: 400 },
    );
  }

  const dietType = dietParam as DietType;
  const categories = categoriesForDiet(dietType);

  return NextResponse.json({
    diet: dietType,
    defaultCategory: defaultCategoryForDiet(dietType),
    categories: categories.map((category) => ({
      id: category,
      label: FOOD_CATEGORY_LABELS[category],
      foods: foodsByCategory(category).map((food) => ({
        id: food.id,
        name: food.name,
        photoUrl: food.photoUrl,
      })),
    })),
  });
}
