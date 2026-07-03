"use client";

import { cn } from "../../../_lib/cn";
import type { DomainOption } from "../../../_lib/onboarding-config";

export function MultiSelectStep({
  options,
  selected,
  onToggle,
  hint = "Tu peux sélectionner plusieurs réponses",
}: {
  options: DomainOption[];
  selected: string[];
  onToggle: (id: string) => void;
  hint?: string;
}) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        {options.map((opt) => {
          const active = selected.includes(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onToggle(opt.id)}
              className={cn(
                "flex items-center gap-2.5 rounded-[var(--cn-radius-sm)] border px-4 py-3 text-left text-sm transition-all duration-200",
                active
                  ? "border-[var(--cn-primary)] bg-[var(--cn-primary-tint)] text-[var(--cn-fg)]"
                  : "border-[var(--cn-border)] bg-[var(--cn-surface)] text-[var(--cn-muted)] hover:border-white/20 hover:text-[var(--cn-fg)]",
              )}
            >
              <span className="text-base">{opt.emoji}</span>
              <span className="font-medium">{opt.label}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-5 text-center text-xs text-[var(--cn-faint)]">{hint}</p>
    </div>
  );
}
