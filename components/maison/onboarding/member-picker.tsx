"use client";

import { Check } from "lucide-react";
import type { OnboardingMember } from "@/components/maison/maison-onboarding-wizard";

const AVATAR_TONES = [
  "bg-sage-soft text-sage",
  "bg-[color-mix(in_oklab,var(--terracotta)_15%,white)] text-terracotta",
  "bg-[color-mix(in_oklab,var(--olive)_18%,white)] text-olive",
  "bg-[color-mix(in_oklab,var(--sage)_12%,white)] text-sage",
  "bg-[color-mix(in_oklab,var(--terracotta)_10%,white)] text-terracotta",
];

function avatarTone(index: number) {
  return AVATAR_TONES[index % AVATAR_TONES.length];
}

type Props = {
  members: OnboardingMember[];
  activeId: string;
  onSelect: (id: string) => void;
  configuredIds?: Set<string>;
};

export function MemberPicker({ members, activeId, onSelect, configuredIds }: Props) {
  return (
    <div className="maison-scroll-x flex gap-2 pb-1 -mx-1 px-1">
      {members.map((m, i) => {
        const active = m.id === activeId;
        const done = configuredIds?.has(m.id);
        const initial = m.name.trim()[0]?.toUpperCase() ?? "?";

        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onSelect(m.id)}
            className={`shrink-0 flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              active
                ? "bg-ink text-cream ring-1 ring-ink"
                : "bg-paper ring-1 ring-black/[0.06] text-ink/85"
            }`}
          >
            <span className="relative shrink-0">
              <span
                className={`size-8 rounded-full grid place-items-center font-serif text-sm leading-none ${
                  active ? "bg-cream/15 text-cream" : avatarTone(i)
                }`}
              >
                {initial}
              </span>
              {done ? (
                <span
                  className={`absolute -bottom-0.5 -right-0.5 size-4 rounded-full grid place-items-center ${
                    active ? "bg-sage text-cream" : "bg-sage text-cream ring-2 ring-paper"
                  }`}
                  aria-label="Profil enregistré"
                >
                  <Check className="h-2.5 w-2.5" strokeWidth={3} />
                </span>
              ) : null}
            </span>
            <span className="max-w-[9rem] truncate">{m.name}</span>
          </button>
        );
      })}
    </div>
  );
}
