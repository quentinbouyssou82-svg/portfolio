import type { Platform } from "@/lib/margeo/types";
import { cn } from "@/lib/margeo/utils";

/**
 * Badge plateforme neutre — initiales / teintes discrètes.
 * Évite d'imiter les logos ou couleurs officielles des marques tierces.
 */
const BRAND: Record<Platform, { label: string; initials: string }> = {
  "Uber Eats": { label: "Uber Eats", initials: "UE" },
  Deliveroo: { label: "Deliveroo", initials: "De" },
  Stuart: { label: "Stuart", initials: "St" },
  "Amazon Flex": { label: "Amazon Flex", initials: "AF" },
  Autre: { label: "Autre", initials: "?" },
};

interface PlatformLogoProps {
  platform: Platform | string;
  size?: "xs" | "sm" | "md";
  showLabel?: boolean;
  className?: string;
}

export function PlatformLogo({
  platform,
  size = "sm",
  showLabel = false,
  className,
}: PlatformLogoProps) {
  const key = (platform in BRAND ? platform : "Autre") as Platform;
  const brand = BRAND[key];
  const dim = size === "xs" ? 20 : size === "md" ? 32 : 24;
  const textSize = size === "xs" ? "text-[8px]" : size === "md" ? "text-[11px]" : "text-[9px]";

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-lg border border-mg-border bg-[var(--mg-surface-muted)] font-semibold tracking-tight text-mg-muted",
          textSize,
        )}
        style={{ width: dim, height: dim }}
        title={brand.label}
        aria-hidden={!showLabel}
      >
        {brand.initials}
      </span>
      {showLabel && (
        <span className="text-xs font-medium text-mg-muted">{brand.label}</span>
      )}
    </span>
  );
}
