"use client";

import { Check } from "lucide-react";
import { cn } from "../../../_lib/cn";
import type { CardOption } from "../../../_lib/onboarding-config";

export function CardSelectStep({
  options,
  selected,
  onSelect,
}: {
  options: CardOption[];
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {options.map((opt) => {
        const active = selected === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelect(opt.id)}
            className={cn(
              "relative flex flex-col gap-2 rounded-[var(--cn-radius-sm)] border p-4 text-left transition-all duration-200",
              active
                ? "border-[var(--cn-primary)] bg-[var(--cn-primary-tint)]"
                : "border-[var(--cn-border)] bg-[var(--cn-surface)] hover:border-white/20",
            )}
          >
            {active && (
              <span className="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-[var(--cn-primary)] text-white">
                <Check className="size-3" />
              </span>
            )}
            <span className="text-xl">{opt.emoji}</span>
            <span className="text-sm font-medium leading-snug text-[var(--cn-fg)]">
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
