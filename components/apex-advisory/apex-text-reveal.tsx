import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Headline word stagger — pure CSS, no JS (Safari-safe). */
export function ApexHeadlineReveal({
  className,
  children,
  hero = false,
  skipEnter = false,
}: {
  className?: string;
  children: ReactNode;
  /** Hero focal headline — cinematic stagger + scroll parallax hooks. */
  hero?: boolean;
  /** Skip rise animation (locale swap — avoids stacked in-flight units). */
  skipEnter?: boolean;
}) {
  return (
    <div
      className={cn(
        "ax-headline-reveal",
        hero && "ax-headline-reveal--hero",
        skipEnter && "ax-headline-reveal--static",
        className,
      )}
      {...(hero ? { "data-ax-hero-headline": true } : {})}
    >
      {children}
    </div>
  );
}

export function ApexTextReveal({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return <span className={cn("ax-text-reveal-inline", className)}>{children}</span>;
}
