import Link from "next/link";
import { ArrowUpRight, Leaf, ShoppingBasket, Sparkles, Wallet } from "lucide-react";
import { MaisonAppShell } from "@/components/maison/maison-app-shell";
import { requireMaisonAppSession } from "@/lib/maison/auth/session";
import { MAISON_PATHS } from "@/lib/maison/constants";
import { getCurrentBudget, getNutritionAnalysis } from "@/lib/maison/services/budget-nutrition";
import { getActiveGroceryList } from "@/lib/maison/services/groceries";
import {
  generateWeekMeals,
  getCurrentWeekPlan,
  getMealsFromPlan,
} from "@/lib/maison/services/meals";
import { getHouseholdMembers } from "@/lib/maison/services/members";
import { weeklyBudgetFromMonthly } from "@/lib/maison/types";
import { formatFrenchDate, getGreeting } from "@/lib/maison/utils/date";

function Ring({ value, label, tone }: { value: number; label: string; tone: string }) {
  return (
    <div className="rounded-2xl bg-paper p-3.5 ring-1 ring-black/[0.04]">
      <p className="text-[10px] uppercase tracking-wider text-ash mb-2.5">{label}</p>
      <div className="h-1 w-full bg-black/[0.06] rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${value}%` }} />
      </div>
      <p className="mt-2 text-[11px] font-medium text-ink/70">{value}%</p>
    </div>
  );
}

export default async function MaisonHomePage() {
  const session = await requireMaisonAppSession();
  const householdId = session.householdId;

  let plan = await getCurrentWeekPlan(householdId);
  let meals = plan ? getMealsFromPlan(plan) : [];

  if (meals.length === 0) {
    try {
      plan = await generateWeekMeals(householdId);
      meals = getMealsFromPlan(plan);
    } catch {
      /* Ollama indisponible — la page reste utilisable sans repas générés */
    }
  }

  const members = await getHouseholdMembers(householdId);
  const { budget, plannedWeekly } = await getCurrentBudget(householdId);
  const nutrition = await getNutritionAnalysis(householdId);
  const grocery = await getActiveGroceryList(householdId);

  const displayName = session.member.name;
  const greeting = getGreeting(displayName);
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = meals.filter((m) => m.day_date >= today).slice(0, 3);

  const balanceScore = nutrition?.scores.find((s) => s.type === "variety")?.value ?? 70;
  const budgetScore = Math.min(
    100,
    Math.round((1 - budget.estimated_cost / plannedWeekly) * 100 + 50),
  );
  const varietyScore = nutrition?.scores.find((s) => s.type === "vegetables")?.value ?? 64;
  const groceryItems = grocery?.items.items ?? [];
  const groceryScore = groceryItems.length
    ? Math.round((groceryItems.filter((i) => i.checked).length / groceryItems.length) * 100)
    : 90;

  const recommendations =
    nutrition?.recommendations.slice(0, 3).map((text, i) => ({
      icon: i === 0 ? Leaf : i === 1 ? Sparkles : ShoppingBasket,
      title: text.split("—")[0]?.trim() ?? text.slice(0, 40),
      body: text,
      tone:
        i === 0
          ? "bg-sage-soft text-sage"
          : i === 1
            ? "bg-[color-mix(in_oklab,var(--terracotta)_15%,white)] text-terracotta"
            : "bg-[color-mix(in_oklab,var(--olive)_15%,white)] text-olive",
    })) ?? [];

  if (grocery && groceryItems.length) {
    recommendations.push({
      icon: ShoppingBasket,
      title: "Liste de courses prête",
      body: `${groceryItems.length} articles, estimés à ${grocery.items.total_estimated.toFixed(2).replace(".", ",")} €.`,
      tone: "bg-[color-mix(in_oklab,var(--olive)_15%,white)] text-olive",
    });
  }

  return (
    <MaisonAppShell>
      <header className="px-6 pt-10 pb-2 flex items-center justify-between animate-rise">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-sage">
            {formatFrenchDate(today)}
          </p>
        </div>
        <div className="flex -space-x-2">
          {members.slice(0, 3).map((m, i) => (
            <div
              key={m.id}
              className="size-9 rounded-full bg-sage-soft ring-2 ring-cream grid place-items-center text-[11px] font-medium text-sage"
              style={{ zIndex: 10 - i }}
            >
              {m.name[0]}
            </div>
          ))}
        </div>
      </header>

      <section className="px-6 mt-4 animate-rise delay-100">
        <div className="rounded-3xl bg-sage-soft/60 p-6 ring-1 ring-sage/10 relative overflow-hidden">
          <div className="flex items-center gap-1.5 text-sage text-[10px] uppercase tracking-[0.18em] mb-3">
            <Sparkles className="h-3 w-3" />
            <span>{session.household.name}</span>
          </div>
          <h2 className="font-serif text-[28px] leading-tight text-ink">{greeting}</h2>
          <p className="mt-2 text-sm text-ink/60 max-w-[32ch] text-pretty">
            Clé foyer : {session.household.household_key}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-2.5">
            <Ring value={balanceScore} label="Équilibre" tone="bg-sage" />
            <Ring value={budgetScore} label="Budget" tone="bg-terracotta" />
            <Ring value={varietyScore} label="Variété" tone="bg-olive" />
            <Ring value={groceryScore} label="Courses" tone="bg-ink" />
          </div>
        </div>
      </section>

      {recommendations.length > 0 ? (
        <section className="px-6 mt-10 animate-rise delay-200">
          <div className="flex items-baseline justify-between mb-4">
            <h3 className="text-sm font-medium">Recommandations</h3>
            <span className="text-[11px] text-ash">{recommendations.length} cette semaine</span>
          </div>
          <div className="space-y-3">
            {recommendations.slice(0, 3).map((rec) => (
              <div
                key={rec.title}
                className="group flex gap-4 p-4 rounded-2xl bg-paper ring-1 ring-black/[0.04]"
              >
                <div className={`size-10 shrink-0 rounded-xl grid place-items-center ${rec.tone}`}>
                  <rec.icon className="h-4 w-4" strokeWidth={1.8} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{rec.title}</p>
                  <p className="text-xs text-ink/55 mt-1 leading-relaxed">{rec.body}</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-ash shrink-0 mt-0.5" />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="px-6 mt-10 animate-rise delay-300">
        <div className="flex items-baseline justify-between mb-4">
          <h3 className="text-sm font-medium">Prochains repas</h3>
          <Link href={MAISON_PATHS.planning} className="text-[11px] text-sage">
            Planning
          </Link>
        </div>
        <div className="space-y-3">
          {upcoming.length > 0 ? (
            upcoming.map((m, idx) => (
              <div key={m.id} className="flex gap-4 items-center">
                {m.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.image_url}
                    alt={m.title}
                    loading="lazy"
                    width={64}
                    height={64}
                    className="size-16 rounded-2xl object-cover ring-1 ring-black/5"
                  />
                ) : (
                  <div className="size-16 rounded-2xl bg-sage-soft ring-1 ring-black/5" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`size-1.5 rounded-full ${idx === 0 ? "bg-ink" : idx === 1 ? "bg-sage" : "bg-olive"}`}
                    />
                    <p className="text-[10px] uppercase tracking-wider text-ash">
                      {m.day_date === today ? "Ce soir" : m.day_date}
                    </p>
                  </div>
                  <p className="text-sm font-medium mt-0.5 truncate">{m.title}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-ash">Générez votre planning depuis l&apos;onglet Repas.</p>
          )}
        </div>
      </section>

      <section className="px-6 mt-10 animate-rise">
        <div className="rounded-3xl bg-ink text-cream p-6 relative overflow-hidden">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-cream/60 flex items-center gap-1.5">
              <Wallet className="h-3 w-3" /> Budget de la semaine
            </p>
            <p className="font-serif text-4xl mt-3">
              {Math.round(budget.estimated_cost)}
              <span className="text-cream/50">/{Math.round(plannedWeekly)} €</span>
            </p>
            <p className="text-xs text-cream/55 mt-1">
              Reste : {Math.max(0, plannedWeekly - budget.estimated_cost).toFixed(0)} € · Mensuel{" "}
              {weeklyBudgetFromMonthly(session.household.budget_monthly).toFixed(0)} €/sem. estimé
            </p>
          </div>
          <div className="mt-5 h-1 w-full bg-cream/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-cream/80"
              style={{
                width: `${Math.min(100, (budget.estimated_cost / plannedWeekly) * 100)}%`,
              }}
            />
          </div>
        </div>
      </section>

      <section className="px-6 mt-10 mb-8 animate-rise">
        <div className="flex items-baseline justify-between mb-4">
          <h3 className="text-sm font-medium">Famille</h3>
          <Link href={MAISON_PATHS.profils} className="text-[11px] text-sage">
            Voir les profils
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {members.slice(0, 3).map((p, i) => {
            const tones = [
              "bg-sage-soft text-sage",
              "bg-[color-mix(in_oklab,var(--terracotta)_15%,white)] text-terracotta",
              "bg-[color-mix(in_oklab,var(--olive)_18%,white)] text-olive",
            ];
            return (
              <div key={p.id} className="rounded-2xl bg-paper ring-1 ring-black/[0.04] p-4 text-center">
                <div
                  className={`size-12 mx-auto rounded-full grid place-items-center font-serif text-xl ${tones[i % 3]}`}
                >
                  {p.name[0]}
                </div>
                <p className="mt-3 text-sm font-medium">{p.name}</p>
                <p className="text-[10px] text-ash mt-0.5">{p.role === "admin" ? "Admin" : "Membre"}</p>
              </div>
            );
          })}
        </div>
      </section>
    </MaisonAppShell>
  );
}
