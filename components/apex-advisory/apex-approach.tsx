"use client";

import { useMemo } from "react";
import { APEX_PHOTOS, APEX_VISUALS } from "@/lib/apex-advisory/visuals";
import { useApexLocale } from "./apex-locale-provider";
import { ApexPhotoLayer } from "./apex-photo-layer";
import { ApexSectionCta, ApexSectionCtaGroup } from "./apex-section-cta";
import { ApexStoryHeadline } from "./apex-story-headline";
import { ApexTimeline } from "./apex-timeline";

function splitNarrativeLines(text: string) {
  return text.split(/(?<=[.;—])\s+/).filter(Boolean);
}

function renderStepName(name: string, keywords: readonly string[]) {
  const pattern = new RegExp(
    `(${keywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "g",
  );
  const parts = name.split(pattern).filter(Boolean);

  return parts.map((part, i) =>
    keywords.includes(part) ? (
      <span key={`${part}-${i}`} data-ax-keyword className="ax-approach-keyword">
        {part}
      </span>
    ) : (
      <span key={`${part}-${i}`}>{part}</span>
    ),
  );
}

export function ApexApproach() {
  const { t } = useApexLocale();
  const { convictions, sectionCtas } = t;
  const introLines = splitNarrativeLines(convictions.intro);

  const convictionSteps = useMemo(
    () =>
      convictions.items.map((item, i) => {
        const bodyLines = splitNarrativeLines(item.text);

        return {
          id: item.num,
          num: item.num,
          title: renderStepName(item.name, item.keywords),
          body: bodyLines.map((line) => <p key={line.slice(0, 24)}>{line}</p>),
          visual: APEX_VISUALS.convictionSteps[i],
        };
      }),
    [convictions.items],
  );

  return (
    <section id="approach" data-ax-story-section className="ax-section ax-section-alt relative">
      <ApexPhotoLayer
        photo={APEX_PHOTOS.sectionApproach}
        variant="section-wash"
        className="ax-section-photo-wash ax-section-photo-wash--left"
      />
      <div className="ax-section-glow" aria-hidden />

      <div className="apex-wrap ax-story-focus relative">
        <div className="ax-divider mb-20 md:mb-28" />

        <div className="grid gap-20 lg:grid-cols-2 lg:gap-32">
          <div className="ax-approach-intro">
            <p className="ax-label" data-ax-reveal>
              {convictions.tag}
            </p>
            <ApexStoryHeadline
              className="ax-headline-lg mt-8 max-w-md"
              lines={[
                convictions.title[0],
                <em key="em" data-ax-keyword className="ax-approach-keyword italic">
                  {convictions.title[1]}
                </em>,
              ]}
            />
            <div data-ax-stagger>
              {introLines.map((line) => (
                <p key={line.slice(0, 24)} data-ax-stagger-item className="ax-body mt-8 block max-w-sm">
                  {line}
                </p>
              ))}
            </div>
            <ApexSectionCta
              label={sectionCtas.approach.inline.label}
              section={sectionCtas.approach.inline.section}
              variant="link"
              className="mt-10"
              reveal
            />
          </div>

          <ApexTimeline steps={convictionSteps} />
        </div>

        <ApexSectionCtaGroup end={sectionCtas.approach.end} />
      </div>
    </section>
  );
}
