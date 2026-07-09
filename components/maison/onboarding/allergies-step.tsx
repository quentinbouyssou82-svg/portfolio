"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import {
  ALLERGY_QUICK_PICKS,
  INTOLERANCE_QUICK_PICKS,
} from "@/lib/maison/foods/types";
import { FOOD_CATALOG } from "@/lib/maison/foods/catalog";

type Props = {
  allergies: string[];
  forbiddenFoods: string[];
  intolerances: string[];
  onChange: (patch: {
    allergies?: string[];
    forbiddenFoods?: string[];
    intolerances?: string[];
  }) => void;
  disabled?: boolean;
};

function ChipToggle({
  label,
  active,
  onClick,
  tone = "sage",
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  tone?: "sage" | "terracotta" | "olive";
}) {
  const activeClass =
    tone === "terracotta"
      ? "bg-terracotta text-cream ring-terracotta"
      : tone === "olive"
        ? "bg-olive/90 text-cream ring-olive/90"
        : "bg-ink text-cream ring-ink";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-2 rounded-full text-xs font-medium ring-1 transition-all active:scale-95 ${
        active ? activeClass : "bg-paper ring-black/[0.06] text-ink/80"
      }`}
    >
      {label}
    </button>
  );
}

function TagList({
  items,
  onRemove,
}: {
  items: string[];
  onRemove: (item: string) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sage-soft text-[11px] text-sage"
        >
          {item}
          <button type="button" onClick={() => onRemove(item)} aria-label={`Retirer ${item}`}>
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
    </div>
  );
}

export function AllergiesStep({ allergies, forbiddenFoods, intolerances, onChange, disabled }: Props) {
  const [customAllergy, setCustomAllergy] = useState("");
  const [customForbidden, setCustomForbidden] = useState("");

  function toggle(list: string[], item: string, key: "allergies" | "intolerances" | "forbiddenFoods") {
    const next = list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
    onChange({ [key]: next });
  }

  const popularForbidden = FOOD_CATALOG.slice(0, 16).map((f) => f.name);

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h3 className="text-sm font-medium">Allergies</h3>
        <div className="flex flex-wrap gap-2">
          {ALLERGY_QUICK_PICKS.map((a) => (
            <ChipToggle
              key={a}
              label={a}
              active={allergies.includes(a)}
              onClick={() => !disabled && toggle(allergies, a, "allergies")}
              tone="terracotta"
            />
          ))}
        </div>
        <div className="flex gap-2">
          <input
            className="maison-input flex-1 py-2 text-sm"
            placeholder="Autre allergie…"
            value={customAllergy}
            onChange={(e) => setCustomAllergy(e.target.value)}
            disabled={disabled}
            onKeyDown={(e) => {
              if (e.key === "Enter" && customAllergy.trim()) {
                toggle(allergies, customAllergy.trim(), "allergies");
                setCustomAllergy("");
              }
            }}
          />
          <button
            type="button"
            disabled={disabled || !customAllergy.trim()}
            onClick={() => {
              toggle(allergies, customAllergy.trim(), "allergies");
              setCustomAllergy("");
            }}
            className="size-10 rounded-xl bg-ink text-cream grid place-items-center shrink-0"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <TagList items={allergies} onRemove={(i) => toggle(allergies, i, "allergies")} />
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-medium">Intolérances</h3>
        <div className="flex flex-wrap gap-2">
          {INTOLERANCE_QUICK_PICKS.map((a) => (
            <ChipToggle
              key={a}
              label={a}
              active={intolerances.includes(a)}
              onClick={() => !disabled && toggle(intolerances, a, "intolerances")}
              tone="olive"
            />
          ))}
        </div>
        <TagList
          items={intolerances}
          onRemove={(i) => toggle(intolerances, i, "intolerances")}
        />
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-medium">Aliments interdits</h3>
        <p className="text-xs text-ash">Sélection rapide — jamais proposés dans vos repas.</p>
        <div className="flex flex-wrap gap-2">
          {popularForbidden.map((name) => (
            <ChipToggle
              key={name}
              label={name}
              active={forbiddenFoods.includes(name)}
              onClick={() => !disabled && toggle(forbiddenFoods, name, "forbiddenFoods")}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <input
            className="maison-input flex-1 py-2 text-sm"
            placeholder="Autre aliment interdit…"
            value={customForbidden}
            onChange={(e) => setCustomForbidden(e.target.value)}
            disabled={disabled}
            onKeyDown={(e) => {
              if (e.key === "Enter" && customForbidden.trim()) {
                toggle(forbiddenFoods, customForbidden.trim(), "forbiddenFoods");
                setCustomForbidden("");
              }
            }}
          />
          <button
            type="button"
            disabled={disabled || !customForbidden.trim()}
            onClick={() => {
              toggle(forbiddenFoods, customForbidden.trim(), "forbiddenFoods");
              setCustomForbidden("");
            }}
            className="size-10 rounded-xl bg-ink text-cream grid place-items-center shrink-0"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <TagList
          items={forbiddenFoods}
          onRemove={(i) => toggle(forbiddenFoods, i, "forbiddenFoods")}
        />
      </section>
    </div>
  );
}
