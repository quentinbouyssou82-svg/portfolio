import { Bell, ChevronRight, Heart, Key, Shield, ShoppingBasket, Users, Wallet } from "lucide-react";
import { MaisonAppShell, MaisonPageHeader } from "@/components/maison/maison-app-shell";
import { MaisonSignOutButton } from "@/components/maison/maison-sign-out-button";
import { requireMaisonAppSession } from "@/lib/maison/auth/session";
import { getHouseholdMembers } from "@/lib/maison/services/members";
import { weeklyBudgetFromMonthly } from "@/lib/maison/types";

export default async function MaisonParametresPage() {
  const session = await requireMaisonAppSession();
  const members = await getHouseholdMembers(session.householdId);
  const weekly = weeklyBudgetFromMonthly(session.household.budget_monthly);

  const groups = [
    {
      label: "Foyer",
      items: [
        { icon: Key, label: "Clé du foyer", hint: session.household.household_key },
        { icon: Users, label: "Membres", hint: `${members.length}` },
        { icon: Heart, label: "Préférences alimentaires" },
        { icon: Wallet, label: "Budget", hint: `${weekly.toFixed(0)} € / sem.` },
      ],
    },
    {
      label: "Connexions",
      items: [
        { icon: ShoppingBasket, label: "Export Leclerc Drive", hint: "JSON" },
        { icon: Bell, label: "Notifications" },
      ],
    },
    {
      label: "Vie privée",
      items: [{ icon: Shield, label: "Confidentialité & données" }],
    },
  ];

  return (
    <MaisonAppShell>
      <MaisonPageHeader eyebrow="Réglages" title="Paramètres" />

      <div className="px-6 space-y-8">
        {groups.map((g) => (
          <section key={g.label} className="animate-rise">
            <h3 className="text-[11px] uppercase tracking-[0.18em] text-ash mb-3 px-1">{g.label}</h3>
            <div className="rounded-2xl bg-paper ring-1 ring-black/[0.04] divide-y divide-border/70">
              {g.items.map((it) => (
                <button
                  key={it.label}
                  type="button"
                  className="w-full flex items-center gap-3 px-5 py-4 text-sm text-left"
                >
                  <it.icon className="h-4 w-4 text-ink/60 shrink-0" strokeWidth={1.7} />
                  <span className="flex-1">{it.label}</span>
                  {it.hint ? <span className="text-[11px] text-ash font-mono">{it.hint}</span> : null}
                  <ChevronRight className="h-4 w-4 text-ash" />
                </button>
              ))}
            </div>
          </section>
        ))}

        <section className="animate-rise">
          <MaisonSignOutButton />
        </section>

        <p className="text-center text-[11px] text-ash py-6">
          Maison · Foyer {session.household.name} · {session.member.name}
        </p>
      </div>
    </MaisonAppShell>
  );
}
