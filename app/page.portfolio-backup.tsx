"use client";

import { Code2, Handshake, SearchCheck, WandSparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { CinematicReveal } from "@/components/motion/cinematic-reveal";
import { FloatBlobs } from "@/components/motion/float-blobs";
import { GsapStagger } from "@/components/motion/gsap-stagger";
import { PageSection } from "@/components/motion/page-section";
import { SubtleParallax } from "@/components/motion/subtle-parallax";
import { Card, CardContent } from "@/components/ui/card";
import { CardHoverGlow } from "@/components/ui/card-hover-glow";
import { PriorityListSection } from "@/components/priority-list-section";
import { ConceptProjectsSection } from "@/components/concept-projects-section";
import { HeroSection } from "@/components/hero-section";
import { PricingSection } from "@/components/pricing-section";
import { SiteHeader } from "@/components/site-header";
import { isPreviewFrame } from "@/hooks/use-responsive-preview";

const services = [
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

export default function Home() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("nocta-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!isPreviewFrame()) return;
    document.body.setAttribute("data-preview-frame", "true");
    return () => document.body.removeAttribute("data-preview-frame");
  }, []);

  const scrollTo = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[var(--background)] text-[var(--foreground)]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="hero-gradient absolute inset-0 opacity-70 max-lg:opacity-50" />
        <SubtleParallax
          maxOffset={8}
          className="absolute -top-32 left-1/2 h-[16rem] w-[16rem] -translate-x-1/2 md:max-lg:h-[22rem] md:max-lg:w-[22rem] lg:h-[35rem] lg:w-[35rem]"
        >
          <div className="size-full rounded-full bg-[var(--glow-soft)] blur-3xl max-lg:blur-2xl" />
        </SubtleParallax>
      </div>
      <FloatBlobs />

      <SiteHeader
        theme={theme}
        onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
        onNavigate={scrollTo}
      />

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 pb-8 pt-[4.75rem] max-md:gap-14 max-md:px-4 max-md:pb-8 max-md:pt-[4.5rem] md:max-lg:gap-20 md:px-10 md:pb-20 md:pt-28 lg:gap-28">
        <HeroSection
          onContact={() => scrollTo("contact")}
          onProjects={() => scrollTo("projects")}
        />

        <PageSection as="div">
          <ConceptProjectsSection onContact={() => scrollTo("contact")} />
        </PageSection>

        <PageSection id="services" className="space-y-7 max-md:space-y-6 md:max-lg:space-y-8 lg:space-y-9">
          <CinematicReveal className="space-y-3">
            <h2 className="text-[1.75rem] font-semibold leading-tight tracking-[-0.02em] max-md:text-[1.65rem] md:text-5xl">
              Ce que nous proposons.
            </h2>
            <p className="max-w-2xl text-base leading-7 text-[var(--muted)] max-md:leading-8 md:text-lg">
              Des services clairs pour créer un site utile, professionnel et facile
              à gérer.
            </p>
          </CinematicReveal>
          <GsapStagger className="grid gap-5 max-md:gap-4 md:max-lg:grid-cols-2 md:max-lg:gap-6 md:grid-cols-2">
            {services.map((service) => (
              <div key={service.title} data-stagger-item>
                <CardHoverGlow className="h-full rounded-3xl">
                  <Card className="service-card premium-interactive h-full">
                    <CardContent className="space-y-4 p-5 max-md:p-5 md:p-7">
                      <div className="flex size-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-strong)]">
                        <service.icon className="size-[18px] text-[var(--foreground)]" />
                      </div>
                      <h3 className="text-lg font-semibold">{service.title}</h3>
                      <p className="text-sm leading-7 text-[var(--muted)]">{service.description}</p>
                    </CardContent>
                  </Card>
                </CardHoverGlow>
              </div>
            ))}
          </GsapStagger>
        </PageSection>

        <PricingSection onContact={() => scrollTo("contact")} />

        <PageSection id="about" className="space-y-5 max-md:space-y-4">
          <CinematicReveal>
            <h2 className="text-[1.75rem] font-semibold leading-tight tracking-[-0.02em] max-md:text-[1.65rem] md:text-5xl">
              L&apos;agence
            </h2>
          </CinematicReveal>
          <CinematicReveal delay={0.08}>
            <CardHoverGlow className="rounded-3xl">
              <Card className="premium-interactive">
                <CardContent className="max-w-3xl p-5 text-base leading-8 text-[var(--muted)] max-md:p-6 max-md:leading-8 md:p-8 md:text-lg">
                  Nocta Agency accompagne les entreprises locales, indépendants et
                  PME dans la création de sites web modernes, performants et
                  orientés résultats. Notre objectif : renforcer votre présence en
                  ligne et transformer vos visiteurs en clients grâce à une
                  expérience digitale soignée.
                </CardContent>
              </Card>
            </CardHoverGlow>
          </CinematicReveal>
        </PageSection>

        <PageSection as="div">
          <PriorityListSection />
        </PageSection>
      </main>
    </div>
  );
}
