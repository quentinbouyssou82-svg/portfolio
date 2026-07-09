"use client";

import { Check } from "lucide-react";
import { DIET_OPTIONS, type DietType } from "@/lib/maison/foods/types";

const DIET_ICONS: Partial<Record<DietType, string>> = {
  omnivore: "/food-assets-3d/beef.png",
  flexitarian: "/food-assets-3d/salad.png",
  pescetarian: "/food-assets-3d/fish.png",
  vegetarian: "/food-assets-3d/broccoli.png",
  vegan: "/food-assets-3d/avocado.png",
};

type Props = {
  value: DietType;
  onChange: (diet: DietType) => void;
  disabled?: boolean;
};

export function DietRegimeStep({ value, onChange, disabled }: Props) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-ink/70 leading-relaxed">
        Choisissez le régime de ce membre. Les catégories d&apos;aliments incompatibles ne
        seront pas proposées à l&apos;étape suivante.
      </p>

      <div className="space-y-2.5">
        {DIET_OPTIONS.map((option) => {
          const selected = value === option.id;
          const icon = DIET_ICONS[option.id];

          return (
            <button
              key={option.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(option.id)}
              className={`maison-diet-card w-full flex items-center gap-3.5 text-left rounded-2xl px-4 py-3.5 transition-all ring-1 ${
                selected
                  ? "bg-sage-soft ring-sage/25 shadow-[0_1px_0_rgba(0,0,0,0.03)]"
                  : "bg-paper ring-black/[0.06] text-ink hover:ring-black/10"
              }`}
            >
              {icon ? (
                <div
                  className={`size-14 shrink-0 rounded-xl grid place-items-center overflow-hidden ${
                    selected ? "bg-cream/80" : "bg-gradient-to-b from-white to-[#f7f6f4]"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- assets 3D locaux */}
                  <img
                    src={icon}
                    alt=""
                    aria-hidden
                    className="size-11 object-contain drop-shadow-sm"
                  />
                </div>
              ) : null}

              <div className="flex-1 min-w-0">
                <span
                  className={`block leading-tight ${
                    selected ? "font-serif text-xl text-sage" : "text-sm font-medium text-ink"
                  }`}
                >
                  {option.label}
                </span>
                <span
                  className={`text-xs block mt-0.5 leading-snug ${
                    selected ? "text-sage/70" : "text-ash"
                  }`}
                >
                  {option.hint}
                </span>
              </div>

              {selected ? (
                <span className="size-7 shrink-0 rounded-full bg-sage text-cream grid place-items-center">
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
