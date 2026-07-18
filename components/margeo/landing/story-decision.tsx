"use client";

import { Brain, CircleCheckBig, Wallet } from "lucide-react";
import { Reveal } from "@/components/margeo/reveal";
import { LandingCta } from "@/components/margeo/landing/landing-cta";
import { SectionShell } from "@/components/margeo/landing/section-shell";

const STEPS = [
  {
    icon: Brain,
    step: "01",
    title: "Uberly analyse",
    description:
      "L'IA lit ta capture : gain, distance, temps, zone. Tes coûts réels inclus.",
    accent: "from-mg-accent/20 via-transparent to-transparent",
  },
  {
    icon: CircleCheckBig,
    step: "02",
    title: "Tu décides",
    description:
      "Accepter, vérifier ou refuser. Score, gain net, explication claire.",
    accent: "from-mg-go/15 via-transparent to-transparent",
  },
  {
    icon: Wallet,
    step: "03",
    title: "Tu gardes plus",
    description:
      "Moins de courses à perte. Ton dashboard suit ta progression.",
    accent: "from-violet-500/15 via-transparent to-transparent",
  },
];

export function StoryDecision() {
  return (
    <SectionShell
      id="solution"
      eyebrow="La solution"
      title="Un verdict clair. Avant le countdown."
      description="Uberly transforme une capture en décision — avant l'expiration."
      border
      className="py-24 sm:py-36"
    >
      <div className="relative">
        <div className="decision-connector hidden md:block" aria-hidden />
        <div className="grid gap-5 md:grid-cols-3 md:gap-6 lg:gap-8">
          {STEPS.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.12}>
              <article
                className={`decision-step landing-card-hover relative p-6 sm:p-7 ${
                  i === 1 ? "md:-translate-y-3 md:scale-[1.02]" : i === 2 ? "md:translate-y-2" : ""
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
                    <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[9px] font-semibold tracking-wide text-mg-faint uppercase">
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
                  <div className="mt-5 flex gap-1.5" aria-hidden>
                    {[0, 1, 2, 3, 4].map((bar) => (
                      <span
                        key={bar}
                        className="h-1 flex-1 rounded-full bg-mg-accent/20"
                        style={{
                          opacity: bar <= i + 1 ? 1 : 0.35,
                          background:
                            bar <= i + 1
                              ? "linear-gradient(90deg, rgba(129,140,248,0.7), rgba(52,211,153,0.45))"
                              : undefined,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>

      <Reveal delay={0.2} className="mt-16 flex justify-center sm:mt-20">
        <LandingCta className="justify-center" />
      </Reveal>
    </SectionShell>
  );
}
