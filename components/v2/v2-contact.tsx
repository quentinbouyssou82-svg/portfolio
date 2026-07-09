"use client";

import { V2Reveal } from "@/components/v2/v2-reveal";
import { PageSection } from "@/components/motion/page-section";
import { PriorityListSection } from "@/components/priority-list-section";

export function V2Contact() {
  return (
    <PageSection id="contact" className="v2-section">
      <div className="v2-wrap">
        <V2Reveal>
          <div className="v2-prose mb-10">
            <p className="v2-kicker">Contact</p>
            <h2 className="v2-h2 mt-3">Rejoindre la liste prioritaire</h2>
          </div>
        </V2Reveal>
        <V2Reveal step="step2">
          <PriorityListSection />
        </V2Reveal>
      </div>
    </PageSection>
  );
}
