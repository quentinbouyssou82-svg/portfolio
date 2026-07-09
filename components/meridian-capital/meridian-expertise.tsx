import {
  BarChart3,
  Landmark,
  LineChart,
  Scale,
  Shield,
  type LucideIcon,
} from "lucide-react";
import { MeridianReveal } from "./meridian-reveal";

const services: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Landmark,
    title: "Structuration financière",
    description:
      "Architecture de véhicules d'investissement, montages de financement et optimisation de la structure capitalistique.",
  },
  {
    icon: Scale,
    title: "Optimisation fiscale",
    description:
      "Stratégies fiscales conformes et durables, intégrées à votre patrimoine global et à vos objectifs de transmission.",
  },
  {
    icon: Shield,
    title: "Modélisation de risques",
    description:
      "Analyse quantitative des expositions, stress tests et tableaux de bord pour une prise de décision éclairée.",
  },
  {
    icon: LineChart,
    title: "Stratégie d'investissement",
    description:
      "Allocation d'actifs sur mesure, sélection de mandats et cohérence avec votre horizon et votre tolérance au risque.",
  },
  {
    icon: BarChart3,
    title: "Conseil patrimonial",
    description:
      "Accompagnement global des dirigeants et family offices — gouvernance, liquidité et structuration successorale.",
  },
];

export function MeridianExpertise() {
  return (
    <section id="expertise" className="mc-section relative">
      <div className="mc-section-divider" />

      <div className="meridian-wrap">
        <div className="max-w-2xl">
          <MeridianReveal>
            <p className="mc-eyebrow">Expertise</p>
            <h2 className="font-display mc-display-md mt-8">
              Des solutions financières
              <em className="text-[var(--mc-text-muted)] not-italic"> sur mesure</em>
            </h2>
            <p className="mc-body mt-6 max-w-lg">
              Cinq domaines d&apos;intervention, une exigence constante : la
              précision, la discrétion et la performance.
            </p>
          </MeridianReveal>
        </div>

        <div className="mt-20 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <MeridianReveal key={service.title} delay={i * 0.07}>
              <article className="mc-card group relative h-full p-8 md:p-9">
                <div className="relative">
                  <div className="mc-card-icon">
                    <service.icon
                      className="size-4 text-[var(--mc-gold)]"
                      strokeWidth={1.25}
                    />
                  </div>
                  <h3 className="mt-7 text-[0.9375rem] font-medium tracking-[0.04em] text-[var(--mc-text)]">
                    {service.title}
                  </h3>
                  <p className="mc-body-sm mt-4">{service.description}</p>
                </div>
              </article>
            </MeridianReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
