"use client";

import { Reveal } from "@/components/margeo/reveal";
import { AnimatedCounter } from "@/components/margeo/animated-counter";

const STATS = [
  { value: 38, suffix: " %", label: "des courses proposées font perdre de l'argent une fois les frais déduits" },
  { value: 2, suffix: " s", label: "pour obtenir un verdict clair, avant la fin du compte à rebours" },
  { value: 214, prefix: "+", suffix: " €", label: "de gain net moyen récupéré par mois par nos livreurs actifs" },
];

export function Presentation() {
  return (
    <section className="border-y border-mg-border bg-mg-surface/60 py-20">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-mg-foreground sm:text-3xl">
            Les plateformes connaissent tes marges.{" "}
            <span className="text-mg-muted">Pas toi.</span>
          </h2>
          <p className="mt-4 leading-relaxed text-mg-muted">
            Entre le retour à vide, l&apos;usure du véhicule et l&apos;attente au
            retrait, une course « bien payée » peut te coûter de l&apos;argent.
            Uberly fait le calcul que tu n&apos;as pas le temps de faire, à
            chaque proposition.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          {STATS.map((stat, i) => (
            <Reveal
              key={stat.label}
              delay={i * 0.1}
              className="rounded-2xl border border-mg-border bg-mg-card p-6 text-center shadow-mg-card"
            >
              <p className="text-4xl font-bold tracking-tight text-mg-accent">
                <AnimatedCounter
                  value={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                />
              </p>
              <p className="mt-3 text-sm leading-relaxed text-mg-muted">
                {stat.label}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
