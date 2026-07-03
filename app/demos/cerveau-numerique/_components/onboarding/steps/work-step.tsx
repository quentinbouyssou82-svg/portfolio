"use client";

import { useState } from "react";
import { Check, Plus, X } from "lucide-react";
import { cn } from "../../../_lib/cn";
import { WORK_OPTIONS } from "../../../_lib/onboarding-config";

export type WorkValue = { option: string | null; tags: string[] };

export function WorkStep({
  value,
  onChange,
}: {
  value: WorkValue;
  onChange: (value: WorkValue) => void;
}) {
  const [draft, setDraft] = useState("");

  const addTag = () => {
    const tag = draft.trim();
    if (!tag || value.tags.includes(tag)) return;
    onChange({ ...value, tags: [...value.tags, tag] });
    setDraft("");
  };

  const removeTag = (tag: string) =>
    onChange({ ...value, tags: value.tags.filter((t) => t !== tag) });

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        {WORK_OPTIONS.map((opt) => {
          const active = value.option === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange({ ...value, option: opt.id })}
              className={cn(
                "flex items-center gap-2.5 rounded-[var(--cn-radius-sm)] border px-4 py-3 text-left text-sm transition-all duration-200",
                active
                  ? "border-[var(--cn-primary)] bg-[var(--cn-primary-tint)] text-[var(--cn-fg)]"
                  : "border-[var(--cn-border)] bg-[var(--cn-surface)] text-[var(--cn-muted)] hover:border-white/20 hover:text-[var(--cn-fg)]",
              )}
            >
              <span className="text-base">{opt.emoji}</span>
              <span className="font-medium leading-snug">{opt.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag();
            }
          }}
          placeholder="Ajouter une autre situation…"
          className="flex-1 rounded-[var(--cn-radius-sm)] border border-[var(--cn-border)] bg-[var(--cn-surface)] px-3 py-2.5 text-sm text-[var(--cn-fg)] placeholder:text-[var(--cn-faint)] transition-colors focus:border-[var(--cn-primary-border)]"
        />
        <button
          type="button"
          onClick={addTag}
          className="inline-flex items-center gap-1 rounded-[var(--cn-radius-sm)] border border-[var(--cn-border)] bg-[var(--cn-surface)] px-3 text-sm font-medium text-[var(--cn-muted)] transition-colors hover:text-[var(--cn-fg)]"
        >
          <Plus className="size-3.5" />
          Ajouter
        </button>
      </div>

      {value.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {value.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--cn-primary-border)] bg-[var(--cn-primary-tint)] px-3 py-1 text-xs font-medium text-[var(--cn-primary)]"
            >
              {tag}
              <Check className="size-3" />
              <button
                type="button"
                onClick={() => removeTag(tag)}
                aria-label={`Retirer ${tag}`}
                className="opacity-60 transition-opacity hover:opacity-100"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
