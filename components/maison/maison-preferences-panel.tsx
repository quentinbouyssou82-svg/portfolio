import type { ReactNode } from "react";
import type { MemberPreferenceSummary } from "@/lib/maison/utils/preferences-summary";

const TONES = [
  "bg-sage-soft text-sage",
  "bg-[color-mix(in_oklab,var(--terracotta)_15%,white)] text-terracotta",
  "bg-[color-mix(in_oklab,var(--olive)_18%,white)] text-olive",
];

type Props = {
  members: MemberPreferenceSummary[];
  highlighted?: boolean;
};

function Chip({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "warn" | "like" }) {
  const cls =
    tone === "warn"
      ? "bg-[color-mix(in_oklab,var(--destructive)_12%,white)] text-[var(--destructive)]"
      : tone === "like"
        ? "bg-sage-soft text-sage"
        : "bg-[color-mix(in_oklab,var(--ink)_6%,white)] text-ink/70";
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${cls}`}>
      {children}
    </span>
  );
}

export function MaisonPreferencesPanel({ members, highlighted }: Props) {
  return (
    <section
      className={`mx-6 mb-6 rounded-3xl bg-paper ring-1 p-4 transition-all animate-rise delay-75 ${
        highlighted ? "ring-sage/40 shadow-[0_0_0_3px_color-mix(in_oklab,var(--sage)_18%,transparent)]" : "ring-black/[0.04]"
      }`}
    >
      <div className="flex items-baseline justify-between gap-2 mb-3">
        <p className="text-[10px] uppercase tracking-[0.18em] text-ash">Préférences du foyer</p>
        <p className="text-[10px] text-ash">{members.length} membre{members.length > 1 ? "s" : ""}</p>
      </div>

      <div className="space-y-3">
        {members.map((m, i) => (
          <div key={m.id} className="flex gap-3">
            <div
              className={`size-9 rounded-full grid place-items-center font-serif text-sm shrink-0 ${TONES[i % TONES.length]}`}
            >
              {m.name[0]}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <p className="text-sm font-medium text-ink">{m.name}</p>
                <span className="text-[10px] text-ash uppercase">{m.role}</span>
              </div>
              <p className="text-[11px] text-ash mt-0.5">
                {m.dietType} · {m.nutritionGoalLabel}
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {m.allergies.length > 0 ? (
                  m.allergies.map((a) => (
                    <Chip key={`${m.id}-a-${a}`} tone="warn">
                      {a}
                    </Chip>
                  ))
                ) : (
                  <Chip>Aucune allergie</Chip>
                )}
                {m.likedFoods.slice(0, 4).map((f) => (
                  <Chip key={`${m.id}-l-${f}`} tone="like">
                    + {f}
                  </Chip>
                ))}
                {m.dislikedFoods.slice(0, 2).map((f) => (
                  <Chip key={`${m.id}-d-${f}`} tone="warn">
                    − {f}
                  </Chip>
                ))}
                {m.mustHaveFoods.slice(0, 2).map((f) => (
                  <Chip key={`${m.id}-m-${f}`}>{f} ✓</Chip>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
