"use client";

import { useState } from "react";
import { Sparkles, X, ArrowRight } from "lucide-react";
import { ViewContainer } from "../shared";

const domainChips = [
  { emoji: "🏠", label: "Maison" },
  { emoji: "👨‍👩‍👧", label: "Famille & amis" },
  { emoji: "❤️", label: "Santé" },
  { emoji: "💰", label: "Argent & contrats" },
  { emoji: "🚗", label: "Véhicules" },
  { emoji: "🎨", label: "Loisirs & projets" },
];

export function HomeView({ name = "erferfer" }: { name?: string }) {
  const [showComplete, setShowComplete] = useState(true);
  const today = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
  const dateLabel = today.charAt(0).toUpperCase() + today.slice(1);

  return (
    <ViewContainer>
      <h1 className="text-2xl font-bold tracking-tight">Bonjour {name}</h1>
      <p className="mt-1 text-sm text-[var(--cn-faint)]">{dateLabel}</p>

      {showComplete && (
        <div className="relative mt-6 flex gap-4 overflow-hidden rounded-[var(--cn-radius)] border border-[var(--cn-primary-border)] bg-[var(--cn-primary-tint)] p-5">
          <span className="hidden size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--cn-primary)]/20 text-[var(--cn-primary)] sm:flex">
            <Sparkles className="size-5" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold">Complète ton cerveau</p>
            <p className="mt-0.5 text-xs text-[var(--cn-muted)]">
              Tu peux ajouter d&apos;autres pans de ta vie à gérer — je prépare le
              rangement en conséquence.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {domainChips.map((chip) => (
                <span
                  key={chip.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--cn-border)] bg-white/[0.04] px-2.5 py-1 text-xs text-[var(--cn-muted)]"
                >
                  <span>{chip.emoji}</span>
                  {chip.label}
                </span>
              ))}
            </div>
            <button className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[image:var(--cn-grad-primary)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--cn-glow)] transition-transform hover:-translate-y-0.5">
              Compléter mon profil
              <ArrowRight className="size-4" />
            </button>
          </div>
          <button
            onClick={() => setShowComplete(false)}
            aria-label="Fermer"
            className="absolute right-3 top-3 text-[var(--cn-faint)] transition-colors hover:text-[var(--cn-fg)]"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      <div className="mt-4 cn-card p-8 text-center">
        <p className="text-lg font-semibold">Rien d&apos;urgent aujourd&apos;hui ✅</p>
        <p className="mt-1 text-sm text-[var(--cn-faint)]">
          Pas de RDV, pas de tâche due, rien à décider. Profite, ou avance sur
          autre chose.
        </p>
      </div>
    </ViewContainer>
  );
}
