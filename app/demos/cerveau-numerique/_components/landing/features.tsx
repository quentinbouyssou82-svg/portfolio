import { Layers, Zap, Sunrise, type LucideIcon } from "lucide-react";
import { Reveal } from "../ui/reveal";

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const features: Feature[] = [
  {
    icon: Layers,
    title: "Tout centralisé",
    description:
      "Mails, documents, tâches et agenda réunis au même endroit.",
  },
  {
    icon: Zap,
    title: "Zéro effort",
    description:
      "L'IA classe, priorise et agit avant même que tu y penses.",
  },
  {
    icon: Sunrise,
    title: "Toujours prêt",
    description:
      "Un récap chaque matin à 7h. Aucune surprise dans la journée.",
  },
];

export function Features() {
  return (
    <section className="relative px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-px overflow-hidden rounded-[var(--cn-radius-lg)] border border-[var(--cn-border)] bg-[var(--cn-border)] sm:grid-cols-3">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <Reveal key={feature.title} delay={i * 0.08} y={16}>
                <article className="h-full bg-[var(--cn-hero-bg)] p-8">
                  <Icon className="size-5 text-[var(--cn-primary)]" strokeWidth={1.75} />
                  <h3 className="mt-5 text-base font-semibold tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--cn-muted)]">
                    {feature.description}
                  </p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
