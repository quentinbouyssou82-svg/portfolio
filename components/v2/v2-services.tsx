"use client";

import { Code2, Handshake, SearchCheck, WandSparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { V2Reveal } from "@/components/v2/v2-reveal";
import { GsapStagger } from "@/components/motion/gsap-stagger";
import { PageSection } from "@/components/motion/page-section";
import { CardHoverGlow } from "@/components/ui/card-hover-glow";

const services: { title: string; description: string; icon: LucideIcon }[] = [
  {
    title: "Création de sites web",
    description:
      "Un site moderne adapté à votre activité (restaurant, freelance, artisan, etc.).",
    icon: Code2,
  },
  {
    title: "Refonte de sites existants",
    description:
      "Modernisation complète pour améliorer votre image et vos résultats.",
    icon: WandSparkles,
  },
  {
    title: "Optimisation mobile",
    description: "Site rapide et parfaitement adapté aux téléphones.",
    icon: SearchCheck,
  },
  {
    title: "Maintenance & suivi",
    description: "Mises à jour et support pour garder un site toujours performant.",
    icon: Handshake,
  },
];

export function V2Services() {
  return (
    <PageSection id="services" className="v2-section">
      <div className="v2-wrap">
        <V2Reveal>
          <div className="v2-prose mb-10">
            <p className="v2-kicker">Services</p>
            <h2 className="v2-h2 mt-3">Ce que nous proposons</h2>
            <p className="v2-body-lg mt-4">
              Des services clairs pour créer un site utile, professionnel et facile à
              gérer.
            </p>
          </div>
        </V2Reveal>

        <GsapStagger className="v2-list">
          {services.map((service) => (
            <div key={service.title} data-stagger-item>
              <CardHoverGlow className="block">
                <article className="v2-list-item premium-interactive">
                  <div className="flex items-center gap-3">
                    <div className="v2-service-icon">
                      <service.icon className="size-4" />
                    </div>
                    <h3 className="text-sm font-medium">{service.title}</h3>
                  </div>
                  <p className="v2-body">{service.description}</p>
                </article>
              </CardHoverGlow>
            </div>
          ))}
        </GsapStagger>
      </div>
    </PageSection>
  );
}
