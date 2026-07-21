"use client";

import { PlatformLogo } from "@/components/margeo/platform-logo";

/** Noms de plateformes (usage descriptif) — badges neutres, sans logos marque. */
const MARQUEE_BRANDS = [
  { id: "Uber Eats", label: "Uber Eats" },
  { id: "Deliveroo", label: "Deliveroo" },
  { id: "Stuart", label: "Stuart" },
  { id: "Amazon Flex", label: "Amazon Flex" },
  { id: "Just Eat", label: "Just Eat" },
  { id: "Glovo", label: "Glovo" },
] as const;

function MarqueeItem({
  id,
  label,
}: {
  id: string;
  label: string;
}) {
  const known =
    id === "Uber Eats" ||
    id === "Deliveroo" ||
    id === "Stuart" ||
    id === "Amazon Flex";

  return (
    <span className="platform-marquee-item inline-flex items-center gap-2.5 whitespace-nowrap">
      {known ? (
        <PlatformLogo platform={id} size="sm" />
      ) : (
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-xl border border-mg-border bg-[var(--mg-surface-muted)] text-[10px] font-semibold text-mg-muted">
          {label.slice(0, 2)}
        </span>
      )}
      <span className="text-sm font-medium tracking-tight text-mg-muted">
        {label}
      </span>
    </span>
  );
}

function MarqueeGroup({ ariaHidden }: { ariaHidden?: boolean }) {
  return (
    <div className="platform-marquee-group" aria-hidden={ariaHidden}>
      {MARQUEE_BRANDS.map((b) => (
        <MarqueeItem key={`${b.id}${ariaHidden ? "-d" : ""}`} {...b} />
      ))}
    </div>
  );
}

/** Bande plateformes — défilement, badges neutres. */
export function PlatformMarquee() {
  return (
    <section
      className="platform-marquee relative border-y border-mg-border/70 py-5 sm:py-6"
      aria-label="Applications de livraison souvent utilisées par les livreurs"
    >
      <div className="platform-marquee-fade platform-marquee-fade-l" aria-hidden />
      <div className="platform-marquee-fade platform-marquee-fade-r" aria-hidden />

      <p className="mx-auto mb-3 max-w-3xl px-5 text-center text-[11px] leading-relaxed text-mg-faint">
        Uberly analyse des captures que tu fournis. Aucun lien, partenariat ni
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
