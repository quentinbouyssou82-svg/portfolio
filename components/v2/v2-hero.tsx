"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { HeroHeadline } from "@/components/motion/hero-headline";
import { PageSection } from "@/components/motion/page-section";
import { HeroDevices } from "@/components/v2/hero-devices/hero-devices";
import { V2Reveal } from "@/components/v2/v2-reveal";
import { MagneticButton } from "@/components/ui/magnetic-button";

type V2HeroProps = {
  theme: "dark" | "light";
  onContact: () => void;
  onProjects: () => void;
};

const headlineWords = [
  { text: "Créez" },
  { text: "un" },
  { text: "site" },
  { text: "web" },
  { text: "plus", breakAfter: true },
  { text: "intelligent", className: "v2-gold font-semibold" },
  { text: "qui" },
  { text: "convertit.", className: "v2-gold font-bold" },
];

const socialProofItems = [
  "Restaurants & cafés",
  "Freelances & créateurs",
  "Artisans & PME locales",
];

export function V2Hero({ theme, onContact, onProjects }: V2HeroProps) {
  return (
    <PageSection id="hero" className="v2-section v2-hero-section">
      <div className="v2-wrap">
        <div className="v2-hero-layout">
          <div className="v2-hero-copy">
            <V2Reveal step="step1">
              <span className="v2-hero-badge">
                <Sparkles className="size-3.5" aria-hidden />
                Agence web premium · IA-ready
              </span>
            </V2Reveal>

            <HeroHeadline words={headlineWords} className="v2-h1 mt-6" />

            <V2Reveal step="step2">
              <div className="v2-hero-divider mt-6" aria-hidden />
            </V2Reveal>

            <V2Reveal step="step3">
              <p className="v2-body-lg mt-6 max-w-xl">
                Nocta conçoit des expériences web{" "}
                <span className="font-medium text-[var(--v2-fg)]">
                  rapides, élégantes et orientées conversion
                </span>
                . Design sur mesure, performance optimisée et intégrations IA pour
                transformer vos visiteurs en clients.
              </p>
            </V2Reveal>

            <V2Reveal step="step4">
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <MagneticButton
                  size="lg"
                  onClick={onContact}
                  className="v2-btn v2-btn-gold hero-cta-primary w-full sm:w-auto"
                >
                  Lancer mon projet
                  <ArrowRight className="size-4" />
                </MagneticButton>
                <MagneticButton
                  size="lg"
                  variant="outline"
                  onClick={onProjects}
                  className="v2-btn v2-btn-ghost w-full sm:w-auto"
                >
                  Voir les réalisations
                </MagneticButton>
              </div>
            </V2Reveal>

            <V2Reveal step="step5">
              <p className="v2-kicker mt-10">Confié par des professionnels locaux</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {socialProofItems.map((item) => (
                  <span key={item} className="v2-proof-pill">
                    {item}
                  </span>
                ))}
              </div>
            </V2Reveal>
          </div>

          <div className="v2-hero-visual">
            <HeroDevices theme={theme} />
          </div>
        </div>
      </div>
    </PageSection>
  );
}
