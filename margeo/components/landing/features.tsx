"use client";

import {
  BrainCircuit,
  Fuel,
  Gauge,
  LineChart,
  RotateCcw,
  Target,
} from "lucide-react";
import { Reveal } from "@/components/reveal";

const FEATURES = [
  {
    icon: BrainCircuit,
    title: "Extraction automatique",
    description:
      "Dépose la capture d'écran, Margeo lit le gain, la distance et le temps. Zéro saisie, zéro friction.",
  },
  {
    icon: Fuel,
    title: "Coûts réels intégrés",
    description:
      "Carburant, usure, assurance : ton coût au kilomètre est appliqué à chaque analyse selon ton véhicule.",
  },
  {
    icon: RotateCcw,
    title: "Retour à vide détecté",
    description:
      "Une dépose en zone morte ? Margeo estime les kilomètres de retour et les déduit de ta marge.",
  },
  {
    icon: Gauge,
    title: "Score de rentabilité",
    description:
      "Un score de 0 à 100 calibré sur tes objectifs, pour décider d'un coup d'œil, même en roulant.",
  },
  {
    icon: Target,
    title: "Objectifs personnalisés",
    description:
      "Fixe ton taux horaire cible et ton objectif journalier. Chaque verdict est calculé pour toi, pas pour la moyenne.",
  },
  {
    icon: LineChart,
    title: "Suivi de tes gains",
    description:
      "Dashboard, historique, évolution : visualise ce que Margeo te fait gagner semaine après semaine.",
  },
];

export function Features() {
  return (
    <section
      id="fonctionnalites"
      className="scroll-mt-20 border-t border-border bg-surface/60 py-24"
    >
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold tracking-wide text-accent uppercase">
            Fonctionnalités
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Pensé pour la route, pas pour les tableurs
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <Reveal
              key={feature.title}
              delay={(i % 3) * 0.1}
              className="group rounded-2xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 hover:shadow-glow"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-accent-soft">
                <feature.icon className="size-5 text-accent" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {feature.description}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
