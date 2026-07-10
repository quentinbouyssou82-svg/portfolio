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
      "L'IA lit ta capture : gain, distance, temps, zone. Elle applique tes coûts réels (essence, usure, retour à vide).",
  },
  {
    icon: CircleCheckBig,
    step: "02",
    title: "Tu prends la bonne décision",
    description:
      "Verdict clair : accepter, vérifier ou refuser. Avec un score, un gain net et une explication que tu comprends.",
  },
  {
    icon: Wallet,
    step: "03",
    title: "Tu gardes plus dans ta poche",
    description:
      "Moins de courses à perte, plus de courses rentables. Ton dashboard suit ta progression jour après jour.",
  },
];

export function StoryDecision() {
  return (
    <SectionShell
      id="solution"
      eyebrow="La solution"
      title="L'IA décide. Toi, tu gagnes."
      description="Uberly transforme une capture floue en une décision claire — avant que le compte à rebours expire."
      border
    >
      <div className="relative">
        <div
          className="absolute top-12 right-[10%] left-[10%] hidden h-px bg-gradient-to-r from-transparent via-mg-border-strong to-transparent md:block"
          aria-hidden
        />
        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.12}>
              <article className="landing-card-hover relative rounded-2xl border border-mg-border bg-mg-card p-6">
                <span className="text-xs font-bold tracking-widest text-mg-accent">
                  {item.step}
                </span>
                <span className="mt-4 flex size-12 items-center justify-center rounded-2xl border border-mg-border bg-mg-surface">
                  <item.icon className="size-5 text-mg-accent" />
                </span>
                <h3 className="mt-5 text-xl font-semibold text-mg-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-mg-muted">
                  {item.description}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>

      <Reveal delay={0.2} className="mt-14 flex justify-center">
        <LandingCta className="justify-center" />
      </Reveal>
    </SectionShell>
  );
}
