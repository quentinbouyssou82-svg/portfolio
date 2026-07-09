"use client";

import { ArrowRight, BookOpen, Code2, ExternalLink } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { CaseStudyModal, CodeModal } from "@/components/concept-project-modals";
import { GsapStagger } from "@/components/motion/gsap-stagger";
import { PageSection } from "@/components/motion/page-section";
import { V2Reveal } from "@/components/v2/v2-reveal";
import { CardHoverGlow } from "@/components/ui/card-hover-glow";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { conceptProjects, type ConceptProject } from "@/lib/concept-projects";
import {
  filterProjects,
  projectFilters,
  type ProjectFilterId,
} from "@/lib/concept-project-filters";

type V2ProjectsProps = {
  onContact: () => void;
};

export function V2Projects({ onContact }: V2ProjectsProps) {
  const [activeFilter, setActiveFilter] = useState<ProjectFilterId>("all");
  const [caseStudyProject, setCaseStudyProject] = useState<ConceptProject | null>(null);
  const [codeProject, setCodeProject] = useState<ConceptProject | null>(null);

  const visibleProjects = useMemo(
    () => filterProjects(conceptProjects, activeFilter),
    [activeFilter],
  );

  return (
    <>
      <PageSection id="projects" className="v2-section">
        <div className="v2-wrap">
          <V2Reveal className="v2-prose mb-12">
            <p className="v2-kicker">Portfolio</p>
              <h2 className="v2-h2 mt-3">Projets conceptuels</h2>
            <p className="v2-body-lg mt-4">
              Des démonstrations illustrant notre approche design, conversion et
              expérience utilisateur — adaptées à des secteurs d&apos;activité réels.
            </p>
            <p className="v2-body mt-4">
              Format Starter · 1 page : chaque démo regroupe toutes les sections en
              une seule page défilante. Les formules Pro et Premium permettent
              plusieurs pages avec navigation complète.
            </p>
          </V2Reveal>

          <div className="v2-filters" role="tablist" aria-label="Filtrer les projets">
            {projectFilters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                role="tab"
                aria-selected={activeFilter === filter.id}
                data-active={activeFilter === filter.id}
                className="v2-filter"
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <GsapStagger key={activeFilter} className="v2-project-list">
            {visibleProjects.map((project) => (
              <div key={project.id} data-stagger-item>
                <CardHoverGlow className="block">
                  <article className="v2-project-row premium-interactive">
                        <button
                          type="button"
                          onClick={() =>
                            window.open(project.demoPath, "_blank", "noopener,noreferrer")
                          }
                          className="v2-project-thumb group/thumb relative block w-full text-left"
                          aria-label={`Ouvrir la démo ${project.name}`}
                        >
                          <Image
                            src={project.image}
                            alt={`Aperçu du projet ${project.name}`}
                            fill
                            className="object-cover object-top"
                            sizes="200px"
                          />
                          <div className="v2-project-demo-overlay">
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                              Voir la démo
                              <ExternalLink className="size-3.5" />
                            </span>
                          </div>
                        </button>

                        <div className="min-w-0 space-y-4">
                          <div>
                            <p className="v2-kicker">{project.sector}</p>
                            <h3 className="mt-1 text-lg font-semibold tracking-tight">
                              {project.name}
                            </h3>
                            <p className="v2-body mt-2">{project.description}</p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {project.technologies.slice(0, 4).map((tech) => (
                              <span key={tech} className="v2-tech-pill">
                                {tech}
                              </span>
                            ))}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <MagneticButton
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                window.open(project.demoPath, "_blank", "noopener,noreferrer")
                              }
                              className="v2-btn v2-btn-ghost text-xs"
                            >
                              Voir la démo
                              <ExternalLink className="size-3.5" />
                            </MagneticButton>
                            <MagneticButton
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setCaseStudyProject(project)}
                              className="v2-btn v2-btn-ghost text-xs"
                            >
                              Étude de cas
                              <BookOpen className="size-3.5" />
                            </MagneticButton>
                            <MagneticButton
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setCodeProject(project)}
                              className="v2-btn v2-btn-ghost text-xs"
                            >
                              Code
                              <Code2 className="size-3.5" />
                            </MagneticButton>
                          </div>
                        </div>
                      </article>
                </CardHoverGlow>
              </div>
            ))}
          </GsapStagger>

          <V2Reveal step="step2">
            <div className="mt-16 v2-prose">
              <p className="v2-body">
                Ces projets sont des démonstrations créées pour présenter le niveau de
                qualité que Nocta propose. Chaque démo correspond au format Starter (1
                page) — l&apos;offre la plus accessible.
              </p>
            </div>
          </V2Reveal>

          <V2Reveal step="step3">
            <div className="v2-cta-banner mt-12 flex flex-col gap-6 border-t border-[var(--v2-border)] pt-12 md:flex-row md:items-center md:justify-between md:gap-10">
              <div className="min-w-0 flex-1">
                <h3 className="text-xl font-semibold tracking-tight md:text-2xl">
                  Votre projet pourrait être le prochain
                </h3>
                <p className="v2-body mt-3 max-w-2xl">
                  Nocta accompagne ses premiers partenaires pour concevoir des sites
                  modernes, rapides et optimisés pour la conversion.
                </p>
              </div>
              <MagneticButton
                size="lg"
                onClick={onContact}
                className="v2-btn v2-btn-gold w-full shrink-0 md:w-auto"
              >
                Discuter de mon projet
                <ArrowRight className="size-4" />
              </MagneticButton>
            </div>
          </V2Reveal>
        </div>
      </PageSection>

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
