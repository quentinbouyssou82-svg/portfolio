"use client";

import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import type { ApexSectionCtaVariant } from "@/lib/apex-advisory/section-ctas";
import { useApexScroll } from "./apex-motion-provider";

type ApexSectionCtaProps = {
  label: string;
  section: string;
  variant?: ApexSectionCtaVariant;
  className?: string;
  reveal?: boolean;
};

function cn(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function ApexSectionCta({
  label,
  section,
  variant = "primary",
  className,
  reveal,
}: ApexSectionCtaProps) {
  const scroll = useApexScroll();
  const go = () => scroll?.scrollTo(`#${section}`);

  if (variant === "link") {
    return (
      <button
        type="button"
        onClick={go}
        className={cn("ax-section-cta-link", className)}
        {...(reveal ? { "data-ax-reveal": true } : {})}
      >
        <span className="ax-section-cta-link-text">{label}</span>
        <ArrowUpRight className="size-3.5 shrink-0" strokeWidth={1.25} aria-hidden />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={go}
      className={cn(
        "ax-section-cta-btn",
        variant === "primary" ? "ax-section-cta-btn-gold" : "ax-section-cta-btn-outline",
        className,
      )}
      {...(reveal ? { "data-ax-reveal": true } : {})}
    >
      <span className="ax-section-cta-btn-label">{label}</span>
    </button>
  );
}

type ApexSectionCtaRowProps = {
  children: ReactNode;
  className?: string;
  align?: "start" | "center";
  reveal?: boolean;
};

export function ApexSectionCtaRow({
  children,
  className,
  align = "start",
  reveal = true,
}: ApexSectionCtaRowProps) {
  return (
    <div
      className={cn(
        "ax-section-cta-row",
        align === "center" && "ax-section-cta-row-center",
        className,
      )}
      {...(reveal ? { "data-ax-reveal": true } : {})}
    >
      {children}
    </div>
  );
}

type ApexSectionCtaGroupProps = {
  inline?: { label: string; section: string };
  end: ReadonlyArray<{ label: string; section: string; variant?: "primary" | "ghost" }>;
  inlineClassName?: string;
  rowClassName?: string;
  rowAlign?: "start" | "center";
};

/** Inline + fin de section — pattern réutilisable. */
export function ApexSectionCtaGroup({
  inline,
  end,
  inlineClassName,
  rowClassName,
  rowAlign = "start",
}: ApexSectionCtaGroupProps) {
  return (
    <>
      {inline ? (
        <ApexSectionCta
          label={inline.label}
          section={inline.section}
          variant="link"
          className={inlineClassName}
          reveal
        />
      ) : null}
      {end.length > 0 ? (
        <ApexSectionCtaRow className={rowClassName} align={rowAlign}>
          {end.map((cta) => (
            <ApexSectionCta
              key={`${cta.section}-${cta.label}`}
              label={cta.label}
              section={cta.section}
              variant={cta.variant ?? "primary"}
            />
          ))}
        </ApexSectionCtaRow>
      ) : null}
    </>
  );
}
