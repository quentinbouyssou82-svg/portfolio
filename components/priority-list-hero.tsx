"use client";

import { Sparkles } from "lucide-react";
import { HeroHeadline } from "@/components/motion/hero-headline";
import { ScrollReveal } from "@/components/motion/scroll-reveal";

const headlineWords = [
  { text: "Réservez", className: "hero-text-gradient font-semibold" },
  { text: "votre" },
  { text: "place", className: "hero-word-emphasis" },
  { text: "parmi", breakAfter: true },
  { text: "les" },
  { text: "premières", className: "hero-text-gradient hero-word-emphasis" },
  { text: "entreprises", className: "hero-text-accent font-bold" },
  { text: "accompagnées.", className: "hero-word-emphasis" },
];

export function PriorityListHero() {
  return (
    <div className="priority-list-hero relative mx-auto max-w-3xl space-y-7 text-center">
      <div aria-hidden className="priority-list-hero-glow pointer-events-none absolute inset-x-0 top-8 mx-auto h-40 w-[min(100%,24rem)]" />

      <ScrollReveal delay={0.05}>
        <p className="priority-list-badge relative inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-1.5 text-xs font-medium tracking-[0.04em] text-[var(--muted)]">
          <Sparkles className="size-3.5 text-[var(--accent)]" aria-hidden />
          Ouverture prochaine
        </p>
      </ScrollReveal>

      <div className="relative">
        <HeroHeadline as="h2" words={headlineWords} className="priority-list-headline" />
      </div>

      <ScrollReveal delay={0.12} className="hero-divider mx-auto h-px w-full max-w-sm">
        <span className="sr-only">Séparateur</span>
      </ScrollReveal>

      <ScrollReveal delay={0.2}>
        <p className="priority-list-subtext mx-auto max-w-2xl text-base leading-8 text-[var(--muted)] md:text-lg md:leading-8">
          Nocta sélectionne actuellement{" "}
          <span className="hero-text-accent font-semibold">quelques entreprises</span> pour ses{" "}
          <span className="hero-word-emphasis text-[var(--foreground)]/90">
            premières refontes web
          </span>{" "}
          et futurs accompagnements digitaux.{" "}
          <span className="hero-text-gradient font-semibold">Rejoignez la liste prioritaire</span>{" "}
          pour être informé en avant-première lors de l&apos;ouverture officielle.
        </p>
      </ScrollReveal>
    </div>
  );
}
