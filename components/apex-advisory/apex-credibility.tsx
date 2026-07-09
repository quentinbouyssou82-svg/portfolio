"use client";

import { useMemo } from "react";
import { APEX_PHOTOS, APEX_VISUALS } from "@/lib/apex-advisory/visuals";
import { useApexLocale } from "./apex-locale-provider";
import { ApexPhotoLayer } from "./apex-photo-layer";
import { ApexSectionCta, ApexSectionCtaGroup } from "./apex-section-cta";
import { ApexStoryHeadline } from "./apex-story-headline";
import { ApexTimeline } from "./apex-timeline";

export function ApexCredibility() {
  const { t } = useApexLocale();
  const { audiences, sectionCtas } = t;

  const audienceSteps = useMemo(
    () =>
      audiences.items.map((item, i) => ({
        id: item.num,
        num: item.num,
        title: item.title,
        body: item.text,
        visual: APEX_VISUALS.audienceSteps[i],
      })),
    [audiences.items],
  );

  return (
    <section id="credibility" data-ax-story-section className="ax-section relative">
      <ApexPhotoLayer
        photo={APEX_PHOTOS.sectionCredibility}
        variant="section-wash"
        className="ax-section-photo-wash ax-section-photo-wash--center"
      />
      <div className="apex-wrap ax-story-focus relative">
        <div className="ax-divider mb-14 md:mb-16" />

        <p className="ax-label" data-ax-reveal>
          {audiences.tag}
        </p>
        <ApexStoryHeadline
          className="ax-headline-lg mt-6 max-w-xl"
          lines={[
            audiences.title[0],
            <em key="em" className="ax-gold-text italic">
              {audiences.title[1]}
            </em>,
          ]}
        />

        <ApexSectionCta
          label={sectionCtas.credibility.inline.label}
          section={sectionCtas.credibility.inline.section}
          variant="link"
          className="mt-8"
          reveal
        />

        <ApexTimeline className="mt-10 md:mt-12" steps={audienceSteps} />

        <blockquote className="ax-quote mx-auto mt-12 max-w-2xl text-center md:mt-14" data-ax-reveal>
          {audiences.quote}
        </blockquote>

        <ApexSectionCtaGroup
          end={sectionCtas.credibility.end}
          rowAlign="center"
          rowClassName="max-w-2xl mx-auto"
        />
      </div>
    </section>
  );
}
