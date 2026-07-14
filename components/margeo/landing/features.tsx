"use client";

import {
  BrainCircuit,
  Fuel,
  Gauge,
  LineChart,
  RotateCcw,
  Target,
} from "lucide-react";
import { Reveal } from "@/components/margeo/reveal";

const FEATURES = [
  {
    icon: BrainCircuit,
    title: "Lecture automatique",
    description:
      "Dépose ta capture. Uberly lit le gain, la distance et le temps. Zéro saisie.",
  },
  {
    icon: Fuel,
    title: "Tes vrais coûts",
    description:
      "Essence, usure, assurance — déduits à chaque course selon ton véhicule.",
  },
  {
    icon: RotateCcw,
    title: "Retour à vide",
    description:
      "Zone morte après la livraison ? Uberly le compte dans ta marge.",
  },
  {
    icon: Gauge,
    title: "Score 0–100",
    description:
      "Un chiffre clair, calibré sur tes objectifs. Décide d'un coup d'œil.",
  },
  {
    icon: Target,
    title: "Tes objectifs",
    description:
      "€/h cible, gain minimum, distance max. Chaque verdict est pour toi.",
  },
  {
    icon: LineChart,
    title: "Suivi des gains",
    description:
      "Dashboard et historique. Vois ce que tu gagnes — et ce que tu évites.",
  },
];

export function Features() {
  return (
    <section
      id="fonctionnalites"
      className="scroll-mt-20 border-t border-mg-border bg-mg-surface/60 py-24"
    >
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold tracking-wide text-mg-accent uppercase">
            La solution
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-mg-foreground sm:text-3xl">
            Tout ce qu&apos;il te faut, sur la route
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <Reveal
              key={feature.title}
              delay={(i % 3) * 0.1}
              className="group rounded-2xl border border-mg-border bg-mg-card p-6 shadow-mg-card transition-colors duration-300 [@media(hover:hover)]:hover:-translate-y-1 [@media(hover:hover)]:hover:border-mg-accent/30 [@media(hover:hover)]:hover:shadow-mg-glow"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-mg-accent-soft">
                <feature.icon className="size-5 text-mg-accent" />
              </div>
              <h3 className="mt-4 font-semibold text-mg-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-mg-muted">
                {feature.description}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
