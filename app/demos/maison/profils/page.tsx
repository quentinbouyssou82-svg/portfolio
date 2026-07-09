import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
import { MaisonAppShell, MaisonPageHeader } from "@/components/maison/maison-app-shell";
import { MaisonSignOutButton } from "@/components/maison/maison-sign-out-button";
import { requireMaisonAppSession } from "@/lib/maison/auth/session";
import { MAISON_PATHS, NUTRITION_GOAL_LABELS } from "@/lib/maison/constants";
import { getHouseholdMembers } from "@/lib/maison/services/members";

const TONES = [
  "bg-sage-soft text-sage",
  "bg-[color-mix(in_oklab,var(--terracotta)_15%,white)] text-terracotta",
  "bg-[color-mix(in_oklab,var(--olive)_18%,white)] text-olive",
];

export default async function MaisonProfilsPage() {
  const session = await requireMaisonAppSession();
  const members = await getHouseholdMembers(session.householdId);

  return (
    <MaisonAppShell>
      <MaisonPageHeader
        eyebrow="Votre foyer"
        title={`${members.length} profil${members.length > 1 ? "s" : ""}, mille saveurs.`}
        subtitle="Chaque membre garde son univers : préférences, refus, objectifs."
      />

      <div className="px-6 space-y-4">
        {members.map((m, i) => {
          const prefs = m.preferences;
          const chips = [
            m.role === "admin" ? "Admin" : "Membre",
            ...((prefs?.liked_foods ?? []).slice(0, 1).map((f) => `Aime ${f}`)),
            prefs?.allergies?.length
              ? `Allergie : ${prefs.allergies.join(", ")}`
              : "Allergie : aucune",
            ...((prefs?.disliked_foods ?? []).slice(0, 1).map((f) => `Refuse : ${f}`)),
          ].filter(Boolean);

          return (
            <div
              key={m.id}
              className="block rounded-3xl bg-paper ring-1 ring-black/[0.04] p-5 animate-rise"
              style={{ animationDelay: `${(i + 1) * 80}ms` }}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`size-14 rounded-full grid place-items-center font-serif text-2xl shrink-0 ${TONES[i % TONES.length]}`}
                >
                  {m.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <p className="font-serif text-xl text-ink leading-none">{m.name}</p>
                    <span className="text-[10px] uppercase tracking-wider text-ash">
                      {m.role}
                    </span>
                  </div>
                  <p className="text-xs text-ink/55 mt-1.5 text-pretty">
                    {m.goals ||
                      `Objectif : ${NUTRITION_GOAL_LABELS[prefs?.nutrition_goal ?? "maintain"]}`}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-ash shrink-0" />
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {chips.map((c) => (
                  <span
                    key={c}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-cream ring-1 ring-black/[0.04] text-ink/70"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          );
        })}

        {session.role === "admin" ? (
          <button
            type="button"
            className="w-full p-5 rounded-3xl border border-dashed border-border text-ash text-sm flex items-center justify-center gap-2 hover:bg-paper/60 transition-colors animate-rise"
          >
            <Plus className="h-4 w-4" />
            Ajouter un membre (partagez la clé {session.household.household_key})
          </button>
        ) : null}
      </div>

      <section className="px-6 mt-12 mb-8 animate-rise">
        <h3 className="text-sm font-medium mb-4">Réglages du foyer</h3>
        <div className="rounded-2xl bg-paper ring-1 ring-black/[0.04] divide-y divide-border/70">
          {[
            "Préférences communes",
            "Allergies & intolérances",
            "Objectifs de la famille",
            "Intégrations courses",
          ].map((label) => (
            <Link
              href={MAISON_PATHS.parametres}
              key={label}
              className="flex items-center justify-between px-5 py-4 text-sm"
            >
              <span>{label}</span>
              <ChevronRight className="h-4 w-4 text-ash" />
            </Link>
          ))}
        </div>
      </section>

      <section className="px-6 mb-8 animate-rise">
        <MaisonSignOutButton />
      </section>
    </MaisonAppShell>
  );
}
