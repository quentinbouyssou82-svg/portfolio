"use client";

import { PlatformLogo } from "@/components/margeo/platform-logo";

/** Marques affichées pour la confiance (marquee). */
const MARQUEE_BRANDS = [
  { id: "Uber Eats", label: "Uber Eats" },
  { id: "Deliveroo", label: "Deliveroo" },
  { id: "Stuart", label: "Stuart" },
  { id: "Amazon Flex", label: "Amazon Flex" },
  { id: "Just Eat", label: "Just Eat", tint: "#FF8000" },
  { id: "Glovo", label: "Glovo", tint: "#FFC244" },
] as const;

function JustEatMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-full" aria-hidden>
      <path
        fill="currentColor"
        d="M7 6.5h2.2l3.3 8.2L15.8 6.5H18l-4.4 11H11.4L7 6.5Z"
      />
    </svg>
  );
}

function GlovoMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-full" aria-hidden>
      <path
        fill="currentColor"
        d="M12 4.5c-3.6 0-6.5 2.6-6.5 5.8 0 2.2 1.3 4.1 3.3 5.1L7.5 19h2.4l1.2-2.3c.3 0 .6.1.9.1.3 0 .6 0 .9-.1L14.1 19h2.4l-1.3-3.6c2-.1 3.8-2.9 3.8-5.1C19 7.1 15.6 4.5 12 4.5Zm0 2.2c2.3 0 4.2 1.6 4.2 3.6S14.3 14 12 14s-4.2-1.6-4.2-3.6S9.7 6.7 12 6.7Z"
      />
    </svg>
  );
}

function MarqueeItem({
  id,
  label,
  tint,
  keySuffix = "",
}: {
  id: string;
  label: string;
  tint?: string;
  keySuffix?: string;
}) {
  if (id === "Just Eat" || id === "Glovo") {
    return (
      <span
        className="platform-marquee-item inline-flex items-center gap-2.5 whitespace-nowrap"
        data-key={`${id}${keySuffix}`}
      >
        <span
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-xl shadow-sm"
          style={{
            backgroundColor: tint,
            color: id === "Glovo" ? "#1a1a1a" : "#fff",
          }}
        >
          {id === "Just Eat" ? <JustEatMark /> : <GlovoMark />}
        </span>
        <span className="text-sm font-medium tracking-tight text-mg-muted">
          {label}
        </span>
      </span>
    );
  }

  return (
    <span className="platform-marquee-item inline-flex items-center gap-2.5 whitespace-nowrap">
      <PlatformLogo platform={id} size="sm" />
      <span className="text-sm font-medium tracking-tight text-mg-muted">
        {label}
      </span>
    </span>
  );
}

/** Deux groupes identiques dans le track → boucle -50%. Desktop : chaque groupe = pleine largeur. */
function MarqueeGroup({ ariaHidden }: { ariaHidden?: boolean }) {
  return (
    <div className="platform-marquee-group" aria-hidden={ariaHidden}>
      {MARQUEE_BRANDS.map((b) => (
        <MarqueeItem key={`${b.id}${ariaHidden ? "-d" : ""}`} {...b} />
      ))}
    </div>
  );
}

/** Bande logos plateformes — défilement infini pleine largeur. */
export function PlatformMarquee() {
  return (
    <section
      className="platform-marquee relative border-y border-mg-border/70 py-5 sm:py-6"
      aria-label="Disclaimer plateformes"
    >
      <div className="platform-marquee-fade platform-marquee-fade-l" aria-hidden />
      <div className="platform-marquee-fade platform-marquee-fade-r" aria-hidden />

      <p className="mx-auto mb-4 max-w-xl px-5 text-center text-[11px] leading-relaxed font-medium tracking-wide text-mg-faint sm:mb-5 sm:text-xs">
        Uberly analyse les captures fournies. Aucun lien, partenariat ni
        affiliation avec ces applications.
      </p>

      <div className="platform-marquee-viewport overflow-hidden">
        <div className="platform-marquee-track">
          <MarqueeGroup />
          <MarqueeGroup ariaHidden />
        </div>
      </div>
    </section>
  );
}
