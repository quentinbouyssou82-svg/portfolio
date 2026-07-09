"use client";

import { Check, X } from "lucide-react";
import { FoodCardImage } from "@/components/maison/onboarding/food-card-image";
import {
  FOOD_CATALOG,
  foodsByCategory,
} from "@/lib/maison/foods/catalog";
import { categoriesForDiet } from "@/lib/maison/foods/diet-categories";
import { countRatings } from "@/lib/maison/foods/sync";
import {
  DISLIKE_FREQUENCY_OPTIONS,
  FOOD_CATEGORY_LABELS,
  FREQUENCY_OPTIONS,
  type ConsumptionFrequency,
  type DietType,
  type FoodCategory,
  type FoodRating,
} from "@/lib/maison/foods/types";

function dietFilterBanner(dietType: DietType): string | null {
  switch (dietType) {
    case "vegetarian":
      return "Viandes et poissons masqués selon votre régime";
    case "vegan":
      return "Viandes, poissons et produits laitiers masqués selon votre régime";
    case "pescetarian":
      return "Viandes masquées selon votre régime";
    default:
      return null;
  }
}

type Props = {
  dietType: DietType;
  foodRatings: Record<string, FoodRating>;
  consumptionHabits: Record<string, ConsumptionFrequency>;
  dislikeLevels: Record<string, ConsumptionFrequency>;
  activeCategory: FoodCategory;
  onCategoryChange: (cat: FoodCategory) => void;
  onRatingChange: (foodId: string, rating: FoodRating) => void;
  onFrequencyChange: (foodId: string, freq: ConsumptionFrequency) => void;
  onDislikeLevelChange: (foodId: string, level: ConsumptionFrequency) => void;
  disabled?: boolean;
};

export function FoodRatingGrid({
  dietType,
  foodRatings,
  consumptionHabits,
  dislikeLevels,
  activeCategory,
  onCategoryChange,
  onRatingChange,
  onFrequencyChange,
  onDislikeLevelChange,
  disabled,
}: Props) {
  const visibleCategories = categoriesForDiet(dietType);
  const safeCategory = visibleCategories.includes(activeCategory)
    ? activeCategory
    : visibleCategories[0];
  const items = foodsByCategory(safeCategory);
  const visibleFoodIds = new Set(
    visibleCategories.flatMap((cat) => foodsByCategory(cat).map((f) => f.id)),
  );
  const counts = countRatings(
    Object.fromEntries(
      [...visibleFoodIds].map((id) => [id, foodRatings[id] ?? "neutral"]),
    ),
  );

  const banner = dietFilterBanner(dietType);

  return (
    <div className="space-y-4">
      {banner ? (
        <p className="rounded-xl bg-sage-soft/45 px-3 py-2 text-[11px] text-sage/90 leading-snug ring-1 ring-sage/10">
          {banner}
        </p>
      ) : null}

      <p className="text-[10px] text-ash/80 tabular-nums">
        <span className="text-sage/80">{counts.likes} aimés</span>
        <span className="mx-1.5 text-ash/40">·</span>
        <span className="text-terracotta/80">{counts.dislikes} évités</span>
        <span className="mx-1.5 text-ash/40">·</span>
        <span>
          {counts.likes + counts.dislikes}/{counts.total}
        </span>
      </p>

      <div className="maison-scroll-x flex gap-1 overflow-x-auto pb-0.5 -mx-1 px-1">
        {visibleCategories.map((cat) => (
          <button
            key={cat}
            type="button"
            disabled={disabled}
            onClick={() => onCategoryChange(cat)}
            className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-medium transition-all ${
              safeCategory === cat
                ? "bg-ink text-cream"
                : "bg-paper ring-1 ring-black/[0.05] text-ash"
            }`}
          >
            {FOOD_CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {items.map((food, i) => {
          const rating = foodRatings[food.id] ?? "neutral";
          const freq = consumptionHabits[food.id] ?? "sometimes";
          const dislikeLevel = dislikeLevels[food.id] ?? "sometimes";
          const isLike = rating === "like";
          const isDislike = rating === "dislike";

          return (
            <article
              key={food.id}
              className={`relative flex flex-col rounded-2xl overflow-hidden transition-all duration-200 maison-food-card bg-paper ${
                isLike
                  ? "ring-2 ring-sage/40 shadow-[0_2px_12px_color-mix(in_oklab,var(--sage)_18%,transparent)]"
                  : isDislike
                    ? "ring-2 ring-terracotta/35 shadow-[0_2px_12px_color-mix(in_oklab,var(--terracotta)_16%,transparent)]"
                    : "ring-1 ring-black/[0.08]"
              }`}
              style={{ animationDelay: `${i * 25}ms` }}
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-b from-white to-[#f7f6f4]">
                <FoodCardImage
                  src={food.photoUrl}
                  name={food.name}
                  className={
                    isDislike
                      ? "opacity-100 saturate-[0.88]"
                      : isLike
                        ? "opacity-100 saturate-[1.06]"
                        : "opacity-100"
                  }
                />
                {isLike ? (
                  <div
                    className="maison-food-tint maison-food-tint--like absolute inset-0 pointer-events-none"
                    aria-hidden
                  />
                ) : null}
                {isDislike ? (
                  <div
                    className="maison-food-tint maison-food-tint--dislike absolute inset-0 pointer-events-none"
                    aria-hidden
                  />
                ) : null}
                {isLike ? (
                  <span className="absolute top-2 right-2 size-6 rounded-full bg-sage/90 text-cream grid place-items-center shadow-sm">
                    <Check className="h-3 w-3" strokeWidth={2.5} />
                  </span>
                ) : null}
                {isDislike ? (
                  <span className="absolute top-2 right-2 size-6 rounded-full bg-terracotta/90 text-cream grid place-items-center shadow-sm">
                    <X className="h-3 w-3" strokeWidth={2.5} />
                  </span>
                ) : null}
              </div>

              <div className="flex-1 flex flex-col p-2.5 text-ink">
                <p className="text-sm font-semibold leading-tight">{food.name}</p>

                {isLike ? (
                  <div className="mt-2 flex gap-1">
                    {FREQUENCY_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => onFrequencyChange(food.id, opt.id)}
                        className={`flex-1 py-1 rounded-md text-[10px] font-medium transition-all ${
                          freq === opt.id
                            ? "bg-sage text-cream"
                            : "bg-sage-soft text-sage hover:bg-sage/15"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                ) : null}

                {isDislike ? (
                  <div className="mt-2 flex gap-1">
                    {DISLIKE_FREQUENCY_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => onDislikeLevelChange(food.id, opt.id)}
                        className={`flex-1 py-1 rounded-md text-[10px] font-medium transition-all ${
                          dislikeLevel === opt.id
                            ? "bg-terracotta text-cream"
                            : "bg-[color-mix(in_oklab,var(--terracotta)_12%,white)] text-terracotta hover:bg-[color-mix(in_oklab,var(--terracotta)_18%,white)]"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                ) : null}

                <div className="mt-2 grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onRatingChange(food.id, isLike ? "neutral" : "like")}
                    className={`flex items-center justify-center gap-1 py-2 rounded-lg text-[11px] font-medium transition-all ${
                      isLike
                        ? "bg-sage-soft text-sage ring-1 ring-sage/25"
                        : isDislike
                          ? "bg-paper text-ink/45 ring-1 ring-black/[0.05] hover:bg-black/[0.02]"
                          : "bg-sage-soft/80 text-sage ring-1 ring-sage/15 hover:bg-sage-soft"
                    }`}
                  >
                    <Check className="h-3 w-3" strokeWidth={2.5} />
                    J&apos;aime
                  </button>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onRatingChange(food.id, isDislike ? "neutral" : "dislike")}
                    className={`flex items-center justify-center gap-1 py-2 rounded-lg text-[11px] font-medium transition-all ${
                      isDislike
                        ? "bg-[color-mix(in_oklab,var(--terracotta)_12%,white)] text-terracotta ring-1 ring-terracotta/25"
                        : isLike
                          ? "bg-paper text-ink/45 ring-1 ring-black/[0.05] hover:bg-black/[0.02]"
                          : "bg-[color-mix(in_oklab,var(--terracotta)_10%,white)] text-terracotta ring-1 ring-terracotta/15 hover:bg-[color-mix(in_oklab,var(--terracotta)_16%,white)]"
                    }`}
                  >
                    <X className="h-3 w-3" strokeWidth={2.5} />
                    Éviter
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <p className="text-[10px] text-center text-ash leading-relaxed">
        Teinte verte = j&apos;aime · teinte terracotta = à éviter · Recliquez pour réinitialiser
      </p>
    </div>
  );
}

export { FOOD_CATALOG };
