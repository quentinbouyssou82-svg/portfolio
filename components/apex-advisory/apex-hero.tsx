"use client";

import type { CSSProperties } from "react";
import { Fragment, useEffect, useRef } from "react";
import { ArrowDown } from "lucide-react";
import { APEX_PHOTOS } from "@/lib/apex-advisory/visuals";
import type { ApexLocale } from "@/lib/apex-advisory/i18n";
import { ApexHeroAtmosphere } from "./apex-abstract-motif";
import { ApexHeroPanel } from "./apex-hero-panel";
import { useApexLocale } from "./apex-locale-provider";
import { useApexScroll } from "./apex-motion-provider";
import { ApexPhotoLayer } from "./apex-photo-layer";
import { ApexHeadlineReveal } from "./apex-text-reveal";

export function ApexHero() {
  const { t, locale } = useApexLocale();
  const scroll = useApexScroll();
  const go = (id: string) => scroll?.scrollTo(`#${id}`);
  const { hero } = t;
  const seenLocale = useRef<ApexLocale | null>(null);
  const skipHeadlineEnter = seenLocale.current !== null && seenLocale.current !== locale;

  useEffect(() => {
    seenLocale.current = locale;
  }, [locale]);

  return (
    <>
      <section
        id="hero"
        className="ax-hero relative flex min-h-[100svh] items-end overflow-x-clip overflow-y-visible pb-28 pt-28 md:items-center md:pb-20 md:pt-32"
      >
        <div className="ax-hero-layer absolute inset-0" aria-hidden>
          <ApexPhotoLayer photo={APEX_PHOTOS.hero} variant="hero" priority />
          <ApexHeroAtmosphere />
          <div className="ax-hero-abstract-scrim" />
          <div className="ax-hero-grid-field">
            <div className="ax-hero-grid-base" />
            <div className="ax-hero-grid-lines" />
            <div className="ax-hero-grid-zone ax-hero-grid-zone-1" />
          </div>
          <div className="ax-hero-grid-scrim" />
          <div className="ax-hero-gradient" />
          <div className="ax-vignette" />
        </div>

        <div className="apex-wrap relative z-10 grid min-w-0 gap-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center lg:gap-12">
          <div className="ax-hero-enter min-w-0 py-12 md:py-20">
            <div className="ax-badge ax-fade-up" style={{ "--ax-i": 0 } as CSSProperties}>
              <span className="ax-badge-dot" aria-hidden />
              {hero.eyebrow}
            </div>

            <ApexHeadlineReveal
              key={locale}
              hero
              skipEnter={skipHeadlineEnter}
              className="ax-headline-xl mt-10 md:mt-12"
            >
              <h1>
                {hero.title.map((line, lineIdx) => (
                  <span
                    key={`${locale}-line-${lineIdx}`}
                    className="ax-unit ax-hero-line"
                    style={{ "--ax-line": lineIdx } as CSSProperties}
                  >
                    {line.parts.map((part, partIdx) =>
                      part.highlight ? (
                        <span
                          key={`${locale}-${lineIdx}-${partIdx}`}
                          className="ax-gold-text ax-hero-accent italic"
                        >
                          {part.text}
                        </span>
                      ) : (
                        <Fragment key={`${locale}-${lineIdx}-${partIdx}`}>{part.text}</Fragment>
                      ),
                    )}
                  </span>
                ))}
              </h1>
            </ApexHeadlineReveal>

            <p
              className="ax-body ax-fade-up mt-10 max-w-md md:mt-12 md:max-w-xl"
              style={{ "--ax-i": 4 } as CSSProperties}
            >
              {hero.subtitle.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>

            <div
              className="ax-fade-up mt-12 flex flex-col gap-4 sm:flex-row sm:items-center md:mt-14"
              style={{ "--ax-i": 5 } as CSSProperties}
            >
              <button type="button" onClick={() => go("contact")} className="ax-btn ax-btn-primary">
                {hero.ctas.primary}
              </button>
              <button type="button" onClick={() => go("services")} className="ax-btn ax-btn-ghost">
                {hero.ctas.secondary}
              </button>
            </div>
          </div>

          <ApexHeroPanel />
        </div>

        <button
          type="button"
          onClick={() => go("services")}
          className="ax-scroll-hint absolute bottom-10 left-1/2 z-10 -translate-x-1/2"
          aria-label={hero.scrollAria}
        >
          <span className="ax-scroll-line" aria-hidden />
          <ArrowDown className="ax-scroll-arrow mx-auto size-3.5" strokeWidth={1.25} />
        </button>
      </section>

      <div className="ax-marquee border-y border-[var(--ax-border-subtle)]" aria-hidden>
        <div className="ax-marquee-track">
          {[...hero.marquee, ...hero.marquee].map((item, i) => (
            <span key={`${item}-${i}`} className="ax-marquee-item">
              {item}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
