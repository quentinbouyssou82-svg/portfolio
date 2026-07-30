"use client";

import { Brain, CircleCheckBig, Wallet } from "lucide-react";
import { Reveal } from "@/components/margeo/reveal";
import { LandingCta } from "@/components/margeo/landing/landing-cta";
import { SectionShell } from "@/components/margeo/landing/section-shell";
import { PlatformLogo } from "@/components/margeo/platform-logo";
import { VerdictBadge } from "@/components/margeo/verdict-badge";

const STEPS = [
  {
    icon: Brain,
    step: "01",
    title: "Driveely analyse",
    description:
      "L'IA lit ta capture : gain, distance, temps, zone. Tes coûts inclus (estimation).",
    accent: "from-mg-accent/20 via-transparent to-transparent",
    visual: "scan" as const,
  },
  {
    icon: CircleCheckBig,
    step: "02",
    title: "Tu décides",
    description:
      "Accepter, vérifier ou refuser. Score, gain net estimé, explication claire.",
    accent: "from-mg-go/15 via-transparent to-transparent",
    visual: "verdict" as const,
  },
  {
    icon: Wallet,
    step: "03",
    title: "Tu gardes plus",
    description:
      "Moins de courses à perte. Ton dashboard suit ta progression.",
    accent: "from-violet-500/15 via-transparent to-transparent",
    visual: "chart" as const,
  },
];

function StepVisual({ kind }: { kind: "scan" | "verdict" | "chart" }) {
  if (kind === "scan") {
    return (
      <div className="decision-mini mt-6 overflow-hidden rounded-xl border border-mg-border bg-mg-surface/80 p-3">
        <div className="flex items-center justify-between gap-2">
          <PlatformLogo platform="Uber Eats" size="xs" showLabel />
          <span className="text-[9px] font-medium text-mg-faint">Capture</span>
        </div>
        <div className="relative mt-3 h-16 overflow-hidden rounded-lg bg-gradient-to-br from-mg-accent/15 to-transparent">
          <div className="decision-mini-scan absolute inset-x-0 h-8 bg-gradient-to-b from-transparent via-mg-accent/30 to-transparent" />
          <p className="absolute inset-0 flex items-center justify-center text-lg font-bold text-mg-foreground">
            7,80 €
          </p>
        </div>
      </div>
    );
  }

  if (kind === "verdict") {
    return (
      <div className="decision-mini mt-6 overflow-hidden rounded-xl border border-mg-border bg-mg-surface/80 p-3">
        <div className="flex items-center justify-between">
          <VerdictBadge verdict="accept" />
          <span className="text-lg font-bold text-mg-go">84</span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {[
            ["Net", "6,10 €"],
            ["€/h", "22,9"],
            ["Coût", "1,80"],
          ].map(([l, v]) => (
            <div
              key={l}
              className="rounded-lg border border-mg-border/80 bg-mg-card/60 px-1.5 py-2 text-center"
            >
              <p className="text-[8px] text-mg-faint uppercase">{l}</p>
              <p className="mt-0.5 text-[11px] font-bold text-mg-foreground">{v}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="decision-mini mt-6 overflow-hidden rounded-xl border border-mg-border bg-mg-surface/80 p-3">
      <div className="flex items-end justify-between gap-1">
        <p className="text-[10px] text-mg-faint">Gain net estimé / soirée (ex.)</p>
        <p className="text-sm font-bold text-mg-go">~42 €</p>
      </div>
      <div className="mt-3 flex h-12 items-end gap-1">
        {[35, 48, 42, 62, 55, 78, 70].map((h, i) => (
          <span
            key={i}
            className="flex-1 rounded-t-sm bg-gradient-to-t from-mg-accent/30 to-mg-accent/80"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function StoryDecision() {
  return (
    <SectionShell
      id="solution"
      eyebrow="La solution"
      title="Un verdict clair. Avant le countdown."
      description="Driveely transforme une capture en décision rentable — gain net estimé avant l'expiration."
      border
      className="py-20 sm:py-28 lg:py-36"
    >
      <div className="relative">
        <div className="decision-connector hidden md:block" aria-hidden />
        <div className="grid gap-5 md:grid-cols-3 md:gap-6 lg:gap-8">
          {STEPS.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.12}>
              <article
                className={`decision-step landing-card-hover relative p-5 sm:p-7 ${
                  i === 1
                    ? "md:-translate-y-3 md:scale-[1.02]"
                    : i === 2
                      ? "md:translate-y-2"
                      : ""
                }`}
              >
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${item.accent}`}
                  aria-hidden
                />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold tracking-[0.2em] text-mg-accent">
                      {item.step}
                    </span>
                    <span className="rounded-full border border-mg-border bg-mg-surface/60 px-2 py-0.5 text-[9px] font-semibold tracking-wide text-mg-faint uppercase">
                      Étape
                    </span>
                  </div>
                  <span className="decision-step-icon mt-5">
                    <item.icon className="size-5 text-mg-accent" />
                  </span>
                  <h3 className="mt-5 text-xl font-semibold tracking-tight text-mg-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-mg-muted">
                    {item.description}
                  </p>
                  <StepVisual kind={item.visual} />
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>

      <Reveal delay={0.2} className="mt-14 flex justify-center sm:mt-20">
        <LandingCta className="justify-center" />
      </Reveal>
    </SectionShell>
  );
}
