"use client";

import { V2Reveal } from "@/components/v2/v2-reveal";
import { PageSection } from "@/components/motion/page-section";
import { CardHoverGlow } from "@/components/ui/card-hover-glow";

export function V2About() {
  return (
    <PageSection id="about" className="v2-section">
      <div className="v2-wrap">
        <V2Reveal>
          <div className="v2-prose">
            <p className="v2-kicker">Agence</p>
            <h2 className="v2-h2 mt-3">L&apos;agence</h2>
          </div>
        </V2Reveal>

        <V2Reveal step="step2">
          <CardHoverGlow className="mt-8 block rounded-lg">
            <div className="premium-interactive v2-about-card rounded-2xl border border-[var(--v2-border)] p-6 md:p-8">
              <p className="v2-body-lg">
                Nocta Agency accompagne les entreprises locales, indépendants et PME dans
                la création de sites web modernes, performants et orientés résultats.
              </p>
              <p className="v2-body mt-4">
                Notre objectif : renforcer votre présence en ligne et transformer vos
                visiteurs en clients grâce à une expérience digitale soignée.
              </p>
            </div>
          </CardHoverGlow>
        </V2Reveal>
      </div>
    </PageSection>
  );
}
