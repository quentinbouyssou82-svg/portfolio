import { Apple, Fish, Leaf, Wheat } from "lucide-react";
import { MaisonAppShell, MaisonPageHeader } from "@/components/maison/maison-app-shell";
import { requireMaisonAppSession } from "@/lib/maison/auth/session";
import { getNutritionAnalysis } from "@/lib/maison/services/budget-nutrition";

function Arc({ value, color }: { value: number; color: string }) {
  const c = 2 * Math.PI * 38;
  return (
    <svg viewBox="0 0 100 100" className="size-full -rotate-90">
      <circle cx="50" cy="50" r="38" stroke="currentColor" strokeOpacity="0.08" strokeWidth="8" fill="none" />
      <circle
        cx="50" cy="50" r="38"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
        strokeDasharray={c}
        strokeDashoffset={c - (c * value) / 100}
        className="transition-[stroke-dashoffset] duration-700"
      />
    </svg>
  );
}

const ICONS = { variety: Leaf, protein: Fish, vegetables: Apple, processed: Wheat, calories: Leaf };
const COLORS: Record<string, string> = {
  variety: "var(--sage)",
  protein: "var(--terracotta)",
  vegetables: "var(--olive)",
  processed: "var(--ink)",
};

export default async function MaisonNutritionPage() {
  const session = await requireMaisonAppSession();
  const analysis = await getNutritionAnalysis(session.householdId);

  const scores = analysis?.scores ?? [
    { label: "Variété", value: 0, note: "Générez un planning pour voir l'analyse.", type: "variety" as const },
    { label: "Protéines", value: 0, note: "", type: "protein" as const },
    { label: "Végétaux", value: 0, note: "", type: "vegetables" as const },
    { label: "Transformés", value: 0, note: "", type: "processed" as const },
  ];

  const tip = analysis?.recommendations[0] ?? "Générez votre semaine pour obtenir des conseils personnalisés.";

  return (
    <MaisonAppShell>
      <MaisonPageHeader
        eyebrow="Cette semaine"
        title="Un bel équilibre."
        subtitle="Pas de chiffres anxieux. Juste une lecture douce de vos habitudes."
      />

      <section className="px-6 animate-rise delay-100">
        <div className="rounded-3xl bg-paper ring-1 ring-black/[0.04] p-6 grid grid-cols-2 gap-5">
          {scores.map((s) => {
            const Icon = ICONS[s.type] ?? Leaf;
            const color = COLORS[s.type] ?? "var(--sage)";
            return (
              <div key={s.label} className="flex flex-col items-center text-center">
                <div className="relative size-24">
                  <Arc value={s.value} color={color} />
                  <div className="absolute inset-0 grid place-items-center">
                    <div>
                      <Icon className="h-4 w-4 mx-auto text-ink/60" strokeWidth={1.6} />
                      <p className="font-serif text-lg leading-none mt-1">{s.value}</p>
                    </div>
                  </div>
                </div>
                <p className="text-xs font-medium mt-3">{s.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      {analysis ? (
        <section className="px-6 mt-6 animate-rise">
          <div className="rounded-2xl bg-paper ring-1 ring-black/[0.04] p-4 grid grid-cols-2 gap-3 text-center text-xs">
            <div>
              <p className="text-ash">Calories / sem.</p>
              <p className="font-medium mt-1">{analysis.weeklyCalories} kcal</p>
            </div>
            <div>
              <p className="text-ash">Protéines</p>
              <p className="font-medium mt-1">{analysis.weeklyProtein} g</p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="px-6 mt-10 animate-rise delay-200">
        <h3 className="text-sm font-medium mb-4">Lectures de la semaine</h3>
        <div className="space-y-3">
          {scores.map((s) => {
            const Icon = ICONS[s.type] ?? Leaf;
            const color = COLORS[s.type] ?? "var(--sage)";
            return (
              <div key={s.label} className="flex gap-4 p-4 rounded-2xl bg-paper ring-1 ring-black/[0.04]">
                <div
                  className="size-9 rounded-xl grid place-items-center shrink-0"
                  style={{ background: `color-mix(in oklab, ${color} 12%, white)` }}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.8} style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-sm font-medium">{s.label}</p>
                    <p className="text-[11px] text-ash tabular-nums">{s.value}/100</p>
                  </div>
                  <p className="text-xs text-ink/55 mt-1 leading-relaxed text-pretty">{s.note}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="px-6 mt-10 mb-8 animate-rise delay-300">
        <div className="rounded-3xl bg-sage-soft/60 ring-1 ring-sage/10 p-6">
          <p className="text-[10px] uppercase tracking-[0.18em] text-sage">Conseil doux</p>
          <p className="font-serif italic text-xl text-ink mt-2 leading-snug text-pretty">
            « {tip} »
          </p>
        </div>
      </section>
    </MaisonAppShell>
  );
}
