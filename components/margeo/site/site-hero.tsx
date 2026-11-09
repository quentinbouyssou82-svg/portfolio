import Image from "next/image";
import Link from "next/link";
import { StoreBadgeRow } from "./store-badges";

const POSTER = "/driveely/marketing/hero-phone-poster.jpg";
const VIDEO = "/driveely/marketing/hero-phone.mp4";

export function SiteHero() {
  return (
    <section
      data-site-hero
      className="relative flex min-h-[100dvh] min-h-[100svh] flex-col overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="hero-bg-poster absolute inset-0 z-[1]">
          {/* LCP element — native img, highest priority, no JS required */}
          <img
            src={POSTER}
            alt=""
            width={1080}
            height={1920}
            fetchPriority="high"
            decoding="sync"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        </div>

        {/* Scroll-scrubbed by site-landing.js (paused + currentTime). No autoplay/loop. */}
        <video
          className="hero-bg-video absolute inset-0 z-[2] h-full w-full object-cover object-center"
          muted
          playsInline
          preload="metadata"
          data-src={VIDEO}
          disablePictureInPicture
          disableRemotePlayback
          tabIndex={-1}
          aria-hidden
        />

        <div className="absolute inset-0 z-[3] bg-[#09090B]/20" />
        <div className="absolute inset-0 z-[3] bg-[radial-gradient(ellipse_at_center,transparent_15%,rgba(9,9,11,0.3)_60%,rgba(9,9,11,0.65)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 z-[3] h-[42%] bg-gradient-to-t from-[#09090B] via-[#09090B]/50 to-transparent" />
        <div className="absolute inset-x-0 top-0 z-[3] h-28 bg-gradient-to-b from-[#09090B]/50 to-transparent" />
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-end px-5 pb-[max(3rem,env(safe-area-inset-bottom))] pt-[max(6.5rem,calc(env(safe-area-inset-top)+4.5rem))] sm:px-8 sm:pb-16 lg:justify-center lg:pb-20 lg:pt-32">
        <div className="mx-auto w-full max-w-[22rem] text-center sm:max-w-xl lg:mx-0 lg:max-w-xl lg:text-left">
          <p className="site-section-label site-hero-enter mb-3 text-white/50 sm:mb-4">
            Le comptable intelligent du livreur
          </p>

          <h1 className="site-hero-enter site-hero-enter-d1 mx-auto text-[2.15rem] font-bold leading-[1.08] tracking-[-0.04em] text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)] sm:max-w-[14ch] sm:text-[3.4rem] lg:mx-0 lg:text-[3.75rem]">
            Vous livrez.
            <br />
            Driveely analyse.
          </h1>

          <p className="site-hero-enter site-hero-enter-d2 mx-auto mt-4 max-w-[34ch] text-[15px] leading-relaxed text-white/72 sm:mt-5 sm:max-w-[40ch] sm:text-[17px] lg:mx-0">
            Suivez vos courses, estimez ce que vous gagnez vraiment après vos
            coûts, et obtenez un verdict clair sur votre rentabilité.
          </p>

          <div
            id="stores"
            className="site-hero-enter site-hero-enter-d3 mt-8 scroll-mt-[calc(4.5rem+env(safe-area-inset-top))] sm:mt-9"
          >
            <StoreBadgeRow className="lg:justify-start" />
            <p className="mt-3 text-[12px] text-white/45">
              iPhone · 2 analyses/jour gratuites · Android bientôt
            </p>
          </div>
        </div>
      </div>

      <a
        href="#probleme"
        className="site-scroll-cue site-scroll-cue-enter absolute bottom-[max(5.5rem,env(safe-area-inset-bottom))] left-1/2 z-10 hidden h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 backdrop-blur-sm sm:flex"
        aria-label="Défiler pour découvrir"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path
            d="M8 3v8M8 11l-3-3M8 11l3-3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </a>
    </section>
  );
}
