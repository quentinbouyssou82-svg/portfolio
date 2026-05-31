"use client";

import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Check, Code2, ExternalLink } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { CinematicReveal } from "@/components/motion/cinematic-reveal";
import { GsapStagger } from "@/components/motion/gsap-stagger";
import { TiltCard } from "@/components/motion/tilt-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CardHoverGlow } from "@/components/ui/card-hover-glow";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { CaseStudyModal, CodeModal } from "@/components/concept-project-modals";
import { conceptProjects, type ConceptProject } from "@/lib/concept-projects";

type ConceptProjectsSectionProps = {
  onContact: () => void;
};

export function ConceptProjectsSection({ onContact }: ConceptProjectsSectionProps) {
  const [caseStudyProject, setCaseStudyProject] = useState<ConceptProject | null>(
    null,
  );
  const [codeProject, setCodeProject] = useState<ConceptProject | null>(null);

  return (
    <>
      <section id="projects" className="space-y-10 max-md:space-y-8 md:max-lg:space-y-11 lg:space-y-12">
        <CinematicReveal className="space-y-4">
          <p className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-1.5 text-xs tracking-[0.08em] text-[var(--muted)]">
            Portfolio · Démonstrations
          </p>
          <h2 className="text-[1.75rem] font-semibold leading-tight tracking-[-0.02em] max-md:text-[1.65rem] md:text-5xl">
            Projets Conceptuels
          </h2>
          <p className="max-w-3xl text-base leading-7 text-[var(--muted)] max-md:leading-8 md:text-lg">
            Des démonstrations illustrant notre approche design, conversion et
            expérience utilisateur. Ces projets types ont été créés pour montrer
            différentes solutions adaptées à des secteurs d&apos;activité réels.
          </p>
          <p className="max-w-3xl rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm leading-7 text-[var(--muted)]">
            <span className="font-medium text-[var(--foreground)]/90">
              Format Starter · 1 page :
            </span>{" "}
            chaque démo regroupe toutes les sections en une seule page défilante
            (modèle le plus accessible). Selon votre abonnement Pro ou Premium,
            votre site peut comporter plusieurs pages distinctes avec navigation
            complète.
          </p>
        </CinematicReveal>

        <GsapStagger className="grid gap-6 max-md:gap-5 md:max-lg:grid-cols-2 md:max-lg:gap-6 lg:grid-cols-3 lg:gap-7">
          {conceptProjects.map((project) => (
            <div key={project.id} data-stagger-item className="h-full">
              <TiltCard className="h-full">
                <CardHoverGlow className="h-full rounded-3xl">
                <Card className="concept-project-card group relative h-full overflow-hidden border-0 shadow-none">
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--ring)] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <CardContent className="flex h-full flex-col gap-5 p-0">
                    <button
                      type="button"
                      onClick={() =>
                        window.open(project.demoPath, "_blank", "noopener,noreferrer")
                      }
                      className="concept-project-media project-media group/image relative aspect-[16/10] w-full overflow-hidden text-left"
                      aria-label={`Ouvrir la démo ${project.name}`}
                    >
                      <div className="concept-project-media-frame absolute inset-0">
                        <Image
                          src={project.image}
                          alt={`Aperçu du projet conceptuel ${project.name}`}
                          fill
                          className="concept-project-thumb object-cover object-top"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                      <div className="concept-project-color-overlay" aria-hidden />
                      <div className="concept-project-light-wash" aria-hidden />
                      <div className="pointer-events-none absolute inset-0 z-[3] bg-gradient-to-t from-[var(--background)]/95 via-[var(--background)]/30 to-transparent" />
                      <div className="absolute inset-0 z-[4] flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover/image:bg-black/25 group-hover/image:opacity-100">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/50 px-4 py-2 text-xs font-medium text-white backdrop-blur-sm">
                          Voir la démo
                          <ExternalLink className="size-3.5" />
                        </span>
                      </div>
                      <span className="concept-badge absolute left-4 top-4 z-[5]">
                        Projet Conceptuel
                      </span>
                    </button>

                    <div className="flex flex-1 flex-col gap-5 px-5 pb-5 max-md:px-4 max-md:pb-4 md:px-6 md:pb-6">
                      <div className="space-y-2">
                        <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                          {project.sector}
                        </p>
                        <h3 className="text-2xl font-semibold tracking-tight">
                          {project.name}
                        </h3>
                        <p className="text-xs font-medium text-[var(--primary-strong)]">
                          {project.highlight}
                        </p>
                        <p className="text-sm leading-7 text-[var(--muted)]">
                          {project.description}
                        </p>
                      </div>

                      <div className="space-y-3">
                        <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--foreground)]/80">
                          Fonctionnalités
                        </p>
                        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                          {project.features.map((feature) => (
                            <li
                              key={feature}
                              className="flex items-center gap-2 text-sm text-[var(--muted)]"
                            >
                              <Check className="size-3.5 shrink-0 text-[var(--ring)]" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--foreground)]/80">
                          Technologies
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {project.technologies.map((tech) => (
                            <span key={tech} className="tech-pill">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-auto flex flex-col gap-2 pt-2 max-md:gap-2.5 sm:grid sm:grid-cols-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="case-study-btn touch-target-sm min-h-11 min-w-0 px-3 text-xs sm:text-xs"
                          onClick={() => setCaseStudyProject(project)}
                        >
                          <span className="truncate">Étude de cas</span>
                          <BookOpen className="size-3 shrink-0" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="touch-target-sm min-h-11 min-w-0 px-3 text-xs sm:text-xs"
                          onClick={() => setCodeProject(project)}
                        >
                          Code
                          <Code2 className="size-3 shrink-0" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                </CardHoverGlow>
              </TiltCard>
            </div>
          ))}
        </GsapStagger>

        <CinematicReveal delay={0.05}>
          <Card className="transparency-card premium-interactive">
            <CardContent className="space-y-3 p-6 max-md:p-6 md:p-10">
              <h3 className="text-xl font-semibold md:text-2xl">
                Une approche transparente
              </h3>
              <p className="max-w-3xl text-sm leading-7 text-[var(--muted)] md:text-base">
                Ces projets sont des démonstrations créées pour présenter le
                niveau de qualité, de design et de finition que Nocta propose à
                ses clients. Chaque démo correspond au format{" "}
                <span className="font-medium text-[var(--foreground)]/90">
                  Starter (1 page)
                </span>{" "}
                — l&apos;offre la plus accessible. Les formules Pro et Premium
                permettent d&apos;étendre le site sur plusieurs pages.
              </p>
            </CardContent>
          </Card>
        </CinematicReveal>

        <CinematicReveal delay={0.08}>
          <Card className="projects-cta-card premium-interactive overflow-hidden">
            <CardContent className="relative flex flex-col gap-6 p-6 max-md:p-6 md:flex-row md:items-center md:justify-between md:p-10">
              <div className="pointer-events-none absolute -right-8 -top-8 size-40 rounded-full bg-[var(--glow-soft)] blur-3xl" />
              <div className="relative space-y-3">
                <h3 className="text-2xl font-semibold md:text-3xl">
                  Votre projet pourrait être le prochain
                </h3>
                <p className="max-w-2xl text-sm leading-7 text-[var(--muted)] md:text-base">
                  Nocta accompagne actuellement ses premiers partenaires pour
                  concevoir des sites web modernes, rapides et optimisés pour la
                  conversion.
                </p>
              </div>
              <MagneticButton size="lg" onClick={onContact} className="relative w-full shrink-0 touch-target md:w-auto">
                Discuter de mon projet
                <ArrowRight className="size-4" />
              </MagneticButton>
            </CardContent>
          </Card>
        </CinematicReveal>
      </section>

      <CaseStudyModal
        project={caseStudyProject}
        open={caseStudyProject !== null}
        onClose={() => setCaseStudyProject(null)}
      />
      <CodeModal
        project={codeProject}
        open={codeProject !== null}
        onClose={() => setCodeProject(null)}
      />
    </>
  );
}
