import type { ReactNode } from "react";
import { cn } from "@/lib/margeo/utils";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  scale?: boolean;
};

/** Server-rendered reveal target — animated by site-landing.js + CSS. */
export function Reveal({
  children,
  className,
  delay = 0,
  scale = false,
}: RevealProps) {
  const delayKey =
    delay > 0 ? String(Math.round(delay * 100) / 100) : undefined;
  return (
    <div
      className={cn("site-reveal", scale && "site-reveal-scale", className)}
      data-reveal
      {...(delayKey ? { "data-reveal-delay": delayKey } : {})}
    >
      {children}
    </div>
  );
}

export function RevealStagger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

export function RevealItem({
  children,
  className,
  index = 0,
}: {
  children: ReactNode;
  className?: string;
  index?: number;
}) {
  return (
    <div
      className={cn("site-reveal site-reveal-item", className)}
      data-reveal
      {...(index > 0 ? { "data-reveal-index": String(index) } : {})}
    >
      {children}
    </div>
  );
}
