"use client";

import { MEAL_SLOT_OPTIONS } from "@/lib/maison/foods/types";

type Props = {
  preferredMeals: string[];
  onPreferredMealsChange: (meals: string[]) => void;
  disabled?: boolean;
};

export function HabitsStep({ preferredMeals, onPreferredMealsChange, disabled }: Props) {
  function toggleMeal(id: string) {
    const next = preferredMeals.includes(id)
      ? preferredMeals.filter((m) => m !== id)
      : [...preferredMeals, id];
    onPreferredMealsChange(next);
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium">Repas préférés</h3>
        <p className="text-xs text-ash mt-1">
          Les fréquences par aliment se configurent à l&apos;étape précédente.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {MEAL_SLOT_OPTIONS.map((m) => {
          const active = preferredMeals.includes(m.id);
          return (
            <button
              key={m.id}
              type="button"
              disabled={disabled}
              onClick={() => toggleMeal(m.id)}
              className={`p-4 rounded-2xl ring-1 text-left transition-all active:scale-[0.98] ${
                active
                  ? "bg-ink text-cream ring-ink"
                  : "bg-paper ring-black/[0.06]"
              }`}
            >
              <span className="text-[10px] uppercase tracking-wider block mb-1 opacity-60">
                {m.hint}
              </span>
              <span className="text-sm font-medium">{m.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
