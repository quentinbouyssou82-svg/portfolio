"use client";

import { Camera, ScanLine, CircleCheckBig } from "lucide-react";
import { Reveal } from "@/components/margeo/reveal";

const STEPS = [
  {
    icon: Camera,
    title: "Capture",
    description:
      "Course Uber Eats, Deliveroo ou Stuart ? Screenshot, comme d'habitude.",
  },
  {
    icon: ScanLine,
    title: "Analyse",
    description:
      "Uberly lit gain, distance, temps et zone. Rien à taper.",
  },
  {
    icon: CircleCheckBig,
    title: "Verdict",
    description:
      "Gain net, €/h, score. Accepter, vérifier ou refuser — en 8 secondes.",
  },
];

export function HowItWorks() {
  return (
    <section id="fonctionnement" className="scroll-mt-20 py-24">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold tracking-wide text-mg-accent uppercase">
            Comment ça marche
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-mg-foreground sm:text-3xl">
            3 gestes. 8 secondes.
          </h2>
        </Reveal>

        <div className="relative mt-14 grid gap-6 md:grid-cols-3">
          <div
            className="absolute top-9 right-[16%] left-[16%] hidden h-px bg-gradient-to-r from-transparent via-mg-border-strong to-transparent md:block"
            aria-hidden
          />

          {STEPS.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.15} className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="relative z-10 flex size-[4.5rem] items-center justify-center rounded-2xl border border-mg-border bg-mg-card shadow-mg-card">
                  <step.icon className="size-7 text-mg-accent" />
                  <span className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-mg-accent-strong text-xs font-bold text-[#04120c]">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-mg-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-mg-muted">
                  {step.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
