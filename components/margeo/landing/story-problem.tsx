"use client";

import { Clock, EyeOff, Fuel } from "lucide-react";
import { Reveal } from "@/components/margeo/reveal";
import { SectionShell } from "@/components/margeo/landing/section-shell";

const PAINS = [
  {
    icon: EyeOff,
    title: "Le gain affiché ment",
    description:
      "Uber Eats montre 7 €. Après essence, retour à vide et temps d'attente, il t'en reste 3,50 €.",
  },
  {
    icon: Clock,
    title: "Tu décides sous pression",
    description:
      "15 secondes pour choisir. Pas le temps de calculer si la course vaut vraiment le coup.",
  },
  {
    icon: Fuel,
    title: "Tu roules à perte sans le savoir",
    description:
      "Les petites courses lointaines s'accumulent. À la fin du mois, tu te demandes où est passé l'argent.",
  },
];

export function StoryProblem() {
  return (
    <SectionShell
      id="probleme"
      eyebrow="Le problème"
      title="Les livreurs perdent de l'argent chaque jour"
      description="Pas par manque d'effort — par manque d'information au bon moment."
      border
    >
      <div className="grid gap-4 md:grid-cols-3">
        {PAINS.map((pain, i) => (
          <Reveal key={pain.title} delay={i * 0.1}>
            <article className="group landing-card-hover h-full rounded-2xl border border-mg-border bg-mg-card/80 p-6 backdrop-blur-sm">
              <span className="flex size-11 items-center justify-center rounded-xl border border-mg-border bg-mg-surface transition-colors group-hover:border-mg-stop/30 group-hover:bg-mg-stop-soft">
                <pain.icon className="size-5 text-mg-stop" />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-mg-foreground">
                {pain.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-mg-muted">
                {pain.description}
              </p>
            </article>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}
