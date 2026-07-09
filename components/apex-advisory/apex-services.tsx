"use client";

import { APEX_PHOTOS, APEX_VISUALS } from "@/lib/apex-advisory/visuals";
import { useApexLocale } from "./apex-locale-provider";
import { ApexPhotoLayer } from "./apex-photo-layer";
import { ApexSectionCta, ApexSectionCtaGroup } from "./apex-section-cta";
import { ApexStoryHeadline } from "./apex-story-headline";
import { ApexVisual } from "./apex-visual";

export function ApexServices() {
  const { t } = useApexLocale();
  const { expertises, sectionCtas } = t;

  return (
    <section id="services" data-ax-story-section className="ax-section relative">
      <ApexPhotoLayer
        photo={APEX_PHOTOS.sectionServices}
        variant="section-wash"
        className="ax-section-photo-wash ax-section-photo-wash--right"
      />
      <div className="apex-wrap ax-story-focus relative">
        <div className="ax-divider mb-20 md:mb-28" />

        <div className="grid gap-16 lg:grid-cols-[minmax(0,1fr)_1.7fr] lg:gap-24">
          <div className="lg:sticky lg:top-28 lg:self-start lg:overflow-visible">
            <p className="ax-label" data-ax-reveal>
              {expertises.tag}
            </p>
            <ApexStoryHeadline
              className="ax-headline-lg mt-8"
              lines={[
                expertises.title[0],
                <em key="em" className="ax-gold-text italic">
                  {expertises.title[1]}
                </em>,
              ]}
            />
            <p className="ax-body mt-8 max-w-sm" data-ax-reveal>
              {expertises.intro}
            </p>
            <ApexSectionCta
              label={sectionCtas.services.inline.label}
              section={sectionCtas.services.inline.section}
              variant="link"
              className="mt-10"
              reveal
            />
          </div>

          <div>
            <div className="ax-card-stack space-y-4" data-ax-stagger>
              {expertises.items.map((item, i) => (
                <article key={item.num} data-ax-stagger-item>
                  <div className="ax-card group relative p-8 md:p-10">
                    <ApexVisual
                      visual={APEX_VISUALS.expertiseCards[i] ?? APEX_VISUALS.expertiseCards[0]}
                      variant="card-bg"
                      parallax={false}
                      reveal={false}
                    />
                    <span className="ax-card-watermark" aria-hidden>
                      {item.num}
                    </span>
                    <span className="ax-card-index">{item.num}</span>
                    <h3
                      data-ax-gold-scroll
                      className="relative font-display mt-4 text-[1.35rem] tracking-[0.01em] md:text-[1.5rem]"
                    >
                      {item.title}
                    </h3>
                    <p className="ax-body-sm relative mt-4 max-w-lg">{item.desc}</p>
                    <div className="ax-card-shine" aria-hidden />
                  </div>
                </article>
              ))}
            </div>

            <ApexSectionCtaGroup end={sectionCtas.services.end} rowClassName="lg:max-w-xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
