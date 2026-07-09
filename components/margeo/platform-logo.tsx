import type { Platform } from "@/lib/margeo/types";
import { cn } from "@/lib/margeo/utils";

const BRAND: Record<
  Platform,
  { label: string; bg: string; fg: string; abbr: string }
> = {
  "Uber Eats": { label: "Uber Eats", bg: "#06C167", fg: "#fff", abbr: "UE" },
  Deliveroo: { label: "Deliveroo", bg: "#00CCBC", fg: "#004440", abbr: "D" },
  Stuart: { label: "Stuart", bg: "#5C6CFF", fg: "#fff", abbr: "S" },
  "Amazon Flex": { label: "Amazon Flex", bg: "#FF9900", fg: "#131921", abbr: "AF" },
  Autre: { label: "Autre", bg: "#3f3f46", fg: "#fafafa", abbr: "?" },
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
  const key = platform as Platform;
  const brand = BRAND[key] ?? BRAND.Autre;
  const dim = size === "xs" ? 18 : size === "md" ? 28 : 22;
  const text = size === "xs" ? "text-[9px]" : size === "md" ? "text-xs" : "text-[10px]";

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-md font-bold",
          text,
        )}
        style={{
          width: dim,
          height: dim,
          backgroundColor: brand.bg,
          color: brand.fg,
        }}
        title={brand.label}
        aria-hidden={!showLabel}
      >
        {brand.abbr}
      </span>
      {showLabel && (
        <span className="text-xs font-medium text-mg-muted">{brand.label}</span>
      )}
    </span>
  );
}
