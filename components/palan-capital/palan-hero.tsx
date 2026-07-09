"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import { ArrowDown } from "lucide-react";
import { PALAN_HERO_IMAGE, PALAN_MARQUEE } from "@/lib/palan-capital/constants";
import { homeContent } from "@/lib/palan-capital/content";
import { usePalanScroll } from "./palan-motion-provider";
import { PalanHeadlineReveal } from "./palan-text-reveal";

const { hero, jurisdictions } = homeContent;

const panelItems = [
  {
    value: jurisdictions[0].name,
    label: `${jurisdictions[0].label} — Courtage · IOBSP · CIF`,
  },
  {
    value: jurisdictions[1].name,
    label: jurisdictions[1].label,
  },
  {
    value: jurisdictions[2].name,
    label: jurisdictions[2].label,
  },
  {
    value: "4 pôles",
    label: "Expertise intégrée",
  },
];

export function PalanHero() {
  const scroll = usePalanScroll();
  const go = (id: string) => scroll?.scrollTo(`#${id}`);

  return (
    <>
      <section
        id="hero"
        className="ax-hero relative flex min-h-[100svh] items-end overflow-hidden pb-28 pt-28 md:items-center md:pb-20 md:pt-32"
      >
        <div className="ax-hero-layer absolute inset-0" aria-hidden>
          <div className="ax-hero-photo">
            <Image
              src={PALAN_HERO_IMAGE.src}
              alt=""
              fill
              priority
              quality={92}
              sizes="100vw"
              className="ax-hero-photo-img"
              style={{ objectPosition: PALAN_HERO_IMAGE.objectPosition }}
            />
          </div>
          <div className="ax-hero-photo-scrim" />
          <div className="ax-hero-photo-tint" />
          <div className="ax-hero-mesh" />
          <div className="ax-hero-gradient" />
          <div className="ax-hero-orb ax-hero-orb-1" />
          <div className="ax-hero-orb ax-hero-orb-2" />
          <div className="ax-hero-beam" />
          <div className="ax-vignette" />
        </div>

        <div className="apex-wrap relative z-10 grid gap-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-12">
          <div className="ax-hero-enter py-12 md:py-20">
            <div className="ax-badge ax-fade-up" style={{ "--ax-i": 0 } as CSSProperties}>
              <span className="ax-badge-dot" aria-hidden />
              {hero.eyebrow}
            </div>

            <PalanHeadlineReveal className="ax-headline-xl mt-10 max-w-[12ch] md:mt-12">
              <h1>
                <span className="ax-unit" style={{ "--ax-i": 0 } as CSSProperties}>
                  {hero.title[0]}
                </span>
                <br />
                <span className="ax-unit ax-gold-text italic" style={{ "--ax-i": 1 } as CSSProperties}>
                  {hero.title[1]}
                </span>
              </h1>
            </PalanHeadlineReveal>

            <p
              className="ax-body ax-fade-up mt-10 max-w-md md:mt-12 md:max-w-lg"
              style={{ "--ax-i": 2 } as CSSProperties}
            >
              {hero.subtitle.join(" — ")}
            </p>

            <div
              className="ax-fade-up mt-12 flex flex-col gap-4 sm:flex-row sm:items-center md:mt-14"
              style={{ "--ax-i": 3 } as CSSProperties}
            >
              <button type="button" onClick={() => go("contact")} className="ax-btn ax-btn-primary">
                Demander un entretien
              </button>
              <button type="button" onClick={() => go("expertises")} className="ax-btn ax-btn-ghost">
                Nos expertises
              </button>
            </div>
          </div>

          <div className="ax-hero-panel ax-fade-up hidden lg:block" style={{ "--ax-i": 4 } as CSSProperties}>
            <p className="ax-label">En un coup d&apos;œil</p>
            <div className="ax-hero-panel-grid mt-8">
              {panelItems.map((item) => (
                <div key={item.value} className="ax-hero-panel-stat">
                  <span className="ax-hero-panel-value">{item.value}</span>
                  <span className="ax-body-sm">{item.label}</span>
                </div>
              ))}
            </div>
            <p className="ax-body-sm mt-8 border-t border-[var(--ax-border-subtle)] pt-6">
              Cabinet indépendant — structuration avant financement. France · Luxembourg · Émirats.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => go("expertises")}
          className="ax-scroll-hint absolute bottom-10 left-1/2 z-10 -translate-x-1/2"
          aria-label="Défiler vers les expertises"
        >
          <span className="ax-scroll-line" aria-hidden />
          <ArrowDown className="ax-scroll-arrow mx-auto size-3.5" strokeWidth={1.25} />
        </button>
      </section>

      <div className="ax-marquee border-y border-[var(--ax-border-subtle)]" aria-hidden>
        <div className="ax-marquee-track">
          {[...PALAN_MARQUEE, ...PALAN_MARQUEE].map((item, i) => (
            <span key={`${item}-${i}`} className="ax-marquee-item">
              {item}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
