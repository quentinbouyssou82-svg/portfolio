"use client";

import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { HeroHeadline } from "@/components/motion/hero-headline";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CardHoverGlow } from "@/components/ui/card-hover-glow";
import { MagneticButton } from "@/components/ui/magnetic-button";

type HeroSectionProps = {
  onContact: () => void;
  onProjects: () => void;
};

const headlineWords = [
  { text: "Créez" },
  { text: "un" },
  { text: "site" },
  { text: "web" },
  { text: "plus", breakAfter: true },
  { text: "intelligent", className: "hero-text-gradient font-semibold" },
  { text: "qui" },
  { text: "convertit.", className: "hero-text-accent font-bold" },
];

const socialProofItems = [
  "Restaurants & cafés",
  "Freelances & créateurs",
  "Artisans & PME locales",
];

export function HeroSection({ onContact, onProjects }: HeroSectionProps) {
  return (
    <section
      id="hero"
      className="relative grid items-center gap-10 pt-6 max-md:gap-8 max-md:pt-4 md:grid-cols-[1.05fr_0.95fr] md:gap-12 md:pt-14 lg:gap-16"
    >
      <div className="relative space-y-7 max-md:space-y-6 md:space-y-9">
        <div aria-hidden className="hero-title-glow pointer-events-none absolute -left-8 top-16 h-36 w-[min(100%,24rem)] max-md:h-28 max-md:w-[min(100%,18rem)] md:-left-12 md:top-20 md:h-56 md:w-[min(100%,28rem)]" />

        <ScrollReveal delay={0.05}>
          <span className="hero-badge inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)]/90 px-4 py-1.5 text-xs font-medium tracking-[0.04em] text-[var(--muted)] backdrop-blur-md">
            <Sparkles className="size-3.5 text-[var(--accent)]" aria-hidden />
            Agence web premium · IA-ready
          </span>
        </ScrollReveal>

        <div className="relative">
          <HeroHeadline words={headlineWords} />
        </div>

        <ScrollReveal delay={0.15}>
          <div className="hero-divider h-px w-full max-w-md" aria-hidden />
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <p className="hero-body max-w-xl text-[1.05rem] leading-8 text-[var(--muted)] max-md:text-base max-md:leading-8 md:text-lg md:leading-8">
            Nocta conçoit des expériences web{" "}
            <span className="hero-highlight-span font-medium text-[var(--foreground)]/95">
              rapides, élégantes et orientées conversion
            </span>
            . Design sur mesure, performance optimisée et intégrations IA pour
            transformer vos visiteurs en clients.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.28}>
          <div className="flex flex-col gap-3 max-md:gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
            <MagneticButton
              size="lg"
              onClick={onContact}
              className="hero-cta-primary group w-full min-w-0 touch-target sm:min-w-[11rem] sm:w-auto shadow-[0_0_0_1px_rgba(255,255,255,0.14)_inset,0_28px_56px_-28px_var(--hero-glow)]"
            >
              Lancer mon projet
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </MagneticButton>
            <MagneticButton
              size="lg"
              variant="outline"
              onClick={onProjects}
              className="hero-cta-secondary w-full min-w-0 touch-target sm:min-w-[11rem] sm:w-auto"
            >
              Voir les réalisations
            </MagneticButton>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.36}>
          <div className="space-y-4 pt-1">
            <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.08em] text-[var(--muted)]">
              <CheckCircle2 className="size-3.5 text-[var(--accent)]" aria-hidden />
              Confié par des professionnels locaux
            </p>
            <div className="flex flex-wrap gap-2">
              {socialProofItems.map((item) => (
                <span key={item} className="hero-proof-pill">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>

      <ScrollReveal delay={0.12} threshold={0.15} className="relative mx-auto w-full max-w-lg max-md:max-w-[min(100%,22rem)] md:max-w-none">
        <div aria-hidden className="hero-visual-glow pointer-events-none absolute inset-0 scale-110 blur-3xl" />
        <CardHoverGlow className="h-full rounded-3xl">
          <Card className="hero-visual-card relative overflow-hidden border-[var(--border)] p-0 shadow-none">
            <div className="hero-visual-chrome flex items-center gap-2 border-b border-[var(--border)] px-4 py-3">
              <span className="size-2.5 rounded-full bg-[#ff5f57]" />
              <span className="size-2.5 rounded-full bg-[#febc2e]" />
              <span className="size-2.5 rounded-full bg-[#28c840]" />
              <span className="ml-2 text-[10px] tracking-wide text-[var(--muted)]">
                nocta.studio / dashboard
              </span>
            </div>

            <div className="space-y-5 p-5 md:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">
                    Performance
                  </p>
                  <p className="hero-display mt-1 text-2xl font-semibold tracking-[-0.03em] md:text-3xl">
                    +127<span className="text-[var(--accent)]">%</span>
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--muted)]">Trafic qualifié ce mois</p>
                </div>
                <div className="hero-metric-icon flex size-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-strong)]">
                  <TrendingUp className="size-4 text-[var(--accent)]" />
                </div>
              </div>

              <div className="hero-chart relative h-24 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--background)]/40 p-3">
                <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-1.5">
                  {[38, 52, 44, 68, 58, 82, 74, 96].map((h, i) => (
                    <div
                      key={i}
                      className="hero-chart-bar w-full rounded-sm"
                      style={{ height: `${h}%`, animationDelay: `${i * 80}ms` }}
                    />
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="hero-stat-card rounded-xl border border-[var(--border)] bg-[var(--surface)]/80 p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-[var(--muted)]">
                    <Zap className="size-3.5 text-[var(--accent)]" />
                    <span className="text-[11px]">Temps de chargement</span>
                  </div>
                  <p className="hero-display mt-2 text-xl font-semibold tracking-[-0.02em]">
                    0.8s
                  </p>
                </div>
                <div className="hero-stat-card rounded-xl border border-[var(--border)] bg-[var(--surface)]/80 p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-[var(--muted)]">
                    <CheckCircle2 className="size-3.5 text-[var(--accent)]" />
                    <span className="text-[11px]">Taux de conversion</span>
                  </div>
                  <p className="hero-display mt-2 text-xl font-semibold tracking-[-0.02em]">
                    4.2×
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[linear-gradient(135deg,var(--surface-strong),color-mix(in_srgb,var(--accent)_8%,transparent))] px-4 py-3">
                <p className="text-xs text-[var(--muted)]">Prochaine livraison estimée</p>
                <p className="text-sm font-semibold text-[var(--foreground)]">5–10 jours</p>
              </div>
            </div>
          </Card>
        </CardHoverGlow>
      </ScrollReveal>
    </section>
  );
}
