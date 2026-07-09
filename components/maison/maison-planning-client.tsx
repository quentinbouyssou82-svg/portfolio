"use client";

import { GripVertical, Plus, RefreshCw, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { MaisonMealGenerationOverlay } from "@/components/maison/maison-meal-generation-overlay";
import { MaisonPreferencesPanel } from "@/components/maison/maison-preferences-panel";
import { MaisonAppShell, MaisonPageHeader } from "@/components/maison/maison-app-shell";
import { generateMealPlanAction, regenerateMealAction } from "@/lib/maison/actions";
import { MEAL_TYPE_LABELS } from "@/lib/maison/constants";
import type { Meal } from "@/lib/maison/types";
import type { MemberPreferenceSummary } from "@/lib/maison/utils/preferences-summary";
import type { PlanningDayGroup } from "@/lib/maison/utils/planning";
import { formatShortDate } from "@/lib/maison/utils/date";

type Props = {
  weekStart: string;
  days: PlanningDayGroup[];
  isAdmin: boolean;
  members: MemberPreferenceSummary[];
  shouldAutoGenerate?: boolean;
};

function MealCard({
  meal,
  isAdmin,
  onRegenerate,
  pending,
}: {
  meal: Meal;
  isAdmin: boolean;
  onRegenerate: (id: string) => void;
  pending: boolean;
}) {
  return (
    <div className="group flex gap-3 p-2.5 pr-3 rounded-2xl bg-paper ring-1 ring-black/[0.04] transition-all hover:ring-black/10">
      {meal.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={meal.image_url}
          alt={meal.title}
          loading="lazy"
          width={56}
          height={56}
          className="size-14 rounded-xl object-cover shrink-0"
        />
      ) : (
        <div className="size-14 rounded-xl bg-sage-soft shrink-0" />
      )}
      <div className="min-w-0 flex-1 flex flex-col justify-center">
        <p className="text-[10px] uppercase tracking-wider text-ash">
          {MEAL_TYPE_LABELS[meal.meal_type] ?? meal.meal_type}
        </p>
        <p className="text-sm font-medium truncate">{meal.title}</p>
        {meal.description ? (
          <p className="text-[11px] text-ash truncate mt-0.5">{meal.description}</p>
        ) : null}
      </div>
      {isAdmin ? (
        <button
          type="button"
          onClick={() => onRegenerate(meal.id)}
          disabled={pending}
          className="shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Régénérer ce repas"
        >
          <GripVertical className="h-4 w-4 text-ash/50" />
        </button>
      ) : null}
    </div>
  );
}

export function MaisonPlanningClient({
  weekStart,
  days,
  isAdmin,
  members,
  shouldAutoGenerate = false,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [generating, setGenerating] = useState(false);
  const [genMode, setGenMode] = useState<"week" | "meal">("week");
  const [error, setError] = useState<string | null>(null);
  const autoStarted = useRef(false);

  const totalMeals = days.reduce((n, d) => n + d.meals.length, 0);
  const isEmpty = totalMeals === 0;

  const runWeekGeneration = useCallback(() => {
    setError(null);
    setGenMode("week");
    setGenerating(true);
    startTransition(async () => {
      const result = await generateMealPlanAction();
      setGenerating(false);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      router.refresh();
    });
  }, [router, startTransition]);

  const runMealRegeneration = useCallback(
    (mealId: string) => {
      setError(null);
      setGenMode("meal");
      setGenerating(true);
      startTransition(async () => {
        const result = await regenerateMealAction(mealId);
        setGenerating(false);
        if (!result.ok) {
          setError(result.message);
          return;
        }
        router.refresh();
      });
    },
    [router, startTransition],
  );

  useEffect(() => {
    if (!shouldAutoGenerate || !isAdmin || !isEmpty || autoStarted.current) return;
    autoStarted.current = true;
    runWeekGeneration();
  }, [shouldAutoGenerate, isAdmin, isEmpty, runWeekGeneration]);

  return (
    <MaisonAppShell>
      <MaisonMealGenerationOverlay
        open={generating || pending}
        mode={genMode}
        error={error}
        onDismissError={() => setError(null)}
      />

      <MaisonPageHeader
        eyebrow={`Semaine du ${formatShortDate(weekStart)}`}
        title="Votre planning"
        subtitle="Composé par l'IA locale, ajustable d'un geste."
      />

      <MaisonPreferencesPanel members={members} highlighted={generating || pending} />

      {isAdmin ? (
        <div className="px-6 flex items-center gap-2 mb-6 animate-rise delay-100">
          <button
            type="button"
            onClick={runWeekGeneration}
            disabled={generating || pending}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-ink text-cream text-sm font-medium disabled:opacity-50"
          >
            {generating || pending ? (
              <>
                <span className="maison-spinner" />
                Génération…
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                {isEmpty ? "Générer la semaine" : "Régénérer"}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={runWeekGeneration}
            disabled={generating || pending}
            className="size-11 rounded-2xl bg-paper ring-1 ring-black/[0.06] grid place-items-center disabled:opacity-50"
            aria-label="Régénérer le planning"
          >
            <RefreshCw className={`h-4 w-4 text-ink/70 ${generating || pending ? "animate-spin" : ""}`} />
          </button>
        </div>
      ) : null}

      {isEmpty && !generating && !pending ? (
        <div className="mx-6 mb-6 rounded-2xl border border-dashed border-border bg-paper/50 p-5 text-center animate-rise">
          <p className="text-sm text-ink/80">Aucun repas pour cette semaine.</p>
          <p className="text-xs text-ash mt-1">
            {isAdmin
              ? "Appuyez sur « Générer la semaine » — l'IA respectera les préférences ci-dessus."
              : "L'administrateur du foyer peut lancer la génération."}
          </p>
        </div>
      ) : null}

      <div className="px-6 space-y-8 mb-8">
        {days.map((d, i) => (
          <section key={d.day} className="animate-rise" style={{ animationDelay: `${(i + 2) * 60}ms` }}>
            <div className="flex items-baseline gap-3 mb-3">
              <span className="font-serif italic text-2xl text-ink">{d.day}</span>
              <span className="text-[11px] text-ash uppercase tracking-wider">{d.date}</span>
              <div className="flex-1 h-px bg-border" />
              <span className="text-[10px] text-ash">{d.meals.length} repas</span>
            </div>

            {d.meals.length > 0 ? (
              <div className="space-y-2">
                {d.meals.map((m) => (
                  <MealCard
                    key={m.id}
                    meal={m}
                    isAdmin={isAdmin}
                    onRegenerate={runMealRegeneration}
                    pending={generating || pending}
                  />
                ))}
              </div>
            ) : (
              <div className="w-full p-5 rounded-2xl border border-dashed border-border text-ash text-xs flex items-center justify-center gap-2">
                <Plus className="h-3.5 w-3.5" />
                Jour libre
              </div>
            )}
          </section>
        ))}
      </div>
    </MaisonAppShell>
  );
}
