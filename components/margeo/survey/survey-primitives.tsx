"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/margeo/utils";

export function SurveyProgressBar({
  step,
  total,
}: {
  step: number;
  total: number;
}) {
  const progress = ((step + 1) / total) * 100;

  return (
    <div className="onboarding-progress mx-auto" aria-hidden>
      <div className="onboarding-progress-track">
        <div
          className="onboarding-progress-fill transition-[width] duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="onboarding-progress-label">
        Étape {step + 1} sur {total}
      </p>
    </div>
  );
}

export function SurveyChoiceButton({
  selected,
  label,
  onSelect,
  compact,
}: {
  selected: boolean;
  label: string;
  onSelect: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "relative w-full rounded-2xl border px-4 text-left transition-[border-color,background-color,box-shadow,transform] duration-200 outline-none focus-visible:ring-2 focus-visible:ring-mg-accent/40",
        compact ? "min-h-11 py-2.5 text-sm" : "min-h-12 py-3 text-[0.9375rem]",
        selected
          ? "border-mg-accent/45 bg-mg-accent-soft/50 text-mg-foreground shadow-[0_0_0_1px_rgba(129,140,248,0.2)_inset]"
          : "border-mg-border bg-[var(--mg-surface-muted)] text-mg-foreground hover:border-mg-border-strong hover:bg-[var(--mg-nav-hover)]",
      )}
    >
      <span className="pr-8 font-medium leading-snug">{label}</span>
      {selected ? (
        <span className="absolute top-1/2 right-3 flex size-6 -translate-y-1/2 items-center justify-center rounded-full bg-mg-accent text-white">
          <Check className="size-3.5" strokeWidth={2.5} />
        </span>
      ) : null}
    </button>
  );
}

export function SurveyScalePicker({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (score: number) => void;
}) {
  return (
    <div>
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
        {Array.from({ length: 10 }, (_, i) => {
          const score = i + 1;
          const selected = value === score;
          return (
            <button
              key={score}
              type="button"
              onClick={() => onChange(score)}
              aria-pressed={selected}
              className={cn(
                "flex aspect-square min-h-11 items-center justify-center rounded-xl border text-sm font-semibold transition duration-200 outline-none focus-visible:ring-2 focus-visible:ring-mg-accent/40",
                selected
                  ? "border-mg-accent bg-mg-accent text-white"
                  : "border-mg-border bg-[var(--mg-surface-muted)] text-mg-muted hover:text-mg-foreground",
              )}
            >
              {score}
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-mg-faint">
        <span>Pas du tout</span>
        <span>Parfait</span>
      </div>
    </div>
  );
}

export function SurveyTextArea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={4}
      placeholder={placeholder ?? "Écris librement…"}
      className="w-full resize-y rounded-2xl border border-mg-border bg-[var(--mg-surface-muted)] px-4 py-3 text-sm leading-relaxed text-mg-foreground outline-none transition placeholder:text-mg-faint focus:border-mg-accent/40 focus:ring-2 focus:ring-mg-accent/20"
    />
  );
}
