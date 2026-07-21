import type { Platform } from "@/lib/margeo/types";
import { cn } from "@/lib/margeo/utils";

const BRAND: Record<
  Platform,
  { label: string; bg: string; fg: string }
> = {
  "Uber Eats": { label: "Uber Eats", bg: "#06C167", fg: "#fff" },
  Deliveroo: { label: "Deliveroo", bg: "#00CCBC", fg: "#00332E" },
  Stuart: { label: "Stuart", bg: "#0B1B3A", fg: "#fff" },
  "Amazon Flex": { label: "Amazon Flex", bg: "#FF9900", fg: "#131921" },
  Autre: { label: "Autre", bg: "#3f3f46", fg: "#fafafa" },
};

function UberEatsMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2" />
      <path
        fill="currentColor"
        d="M7.5 15.2c1.3 1.5 3.2 2.4 5.3 2.4 3.9 0 7-3.1 7-7s-3.1-7-7-7c-2.1 0-4 .9-5.3 2.4l1.6 1.4A4.9 4.9 0 0 1 12.8 6c2.8 0 5 2.2 5 5s-2.2 5-5 5a4.9 4.9 0 0 1-3.7-1.6l-1.6 1.8Z"
      />
    </svg>
  );
}

function DeliverooMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M6 7.5c0-1.4 1.1-2.5 2.5-2.5H14c3 0 5.5 2.4 5.5 5.4 0 2.4-1.5 4.4-3.7 5.1L18 19h-2.3l-1.9-3.5H10V19H7.5V7.5H6Zm4 5.5h3.3c1.4 0 2.5-1.1 2.5-2.5S14.7 8 13.3 8H10v5Z"
      />
    </svg>
  );
}

function StuartMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M5 7.2h8.2c2.9 0 5.3 2.1 5.3 4.8S16.1 17 13.2 17H8.4v2.8H5.6V7.2H5Zm3.4 2.5v4.8h4.6c1.4 0 2.5-1 2.5-2.4s-1.1-2.4-2.5-2.4H8.4Z"
      />
    </svg>
  );
}

function AmazonMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M4.8 14.2c2.8 1.6 6.4 2.5 9.8 2.5 2.4 0 4.7-.5 6.6-1.3.4-.2.8.2.5.5-1.8 2-5.1 3.1-8.4 3.1-3.8 0-7.2-1.3-9.5-3.1-.3-.3 0-.8.4-.7l.6-.1Zm14.3-1.8c.3-.1.5.2.4.4-.5 1.5-1.9 2.1-2.1 1.9-.1-.1 0-.3.2-.6.4-.6.9-1.3 1.5-1.7Z"
      />
      <path
        fill="currentColor"
        d="M15.2 6.2c-.7-.8-1.8-1.2-3.2-1.2-2.4 0-4.3 1.7-4.3 4.1 0 2.2 1.6 3.6 3.8 3.6 1.2 0 2.1-.3 2.8-.8v.5h2.1V5.5c0-2.2-1.4-3.7-3.8-3.7-1.6 0-2.9.6-3.8 1.7l1.6 1.2c.5-.7 1.3-1.1 2.2-1.1 1.1 0 1.8.6 1.8 1.7v.9Zm-2.1 4.5c-.5.3-1.1.4-1.8.4-1.3 0-2.1-.8-2.1-2s.8-2 2.1-2c.7 0 1.3.2 1.8.5v3.1Z"
      />
    </svg>
  );
}

function GenericMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="12" r="8" fill="currentColor" opacity="0.2" />
      <circle cx="12" cy="12" r="3.5" fill="currentColor" />
    </svg>
  );
}

function Mark({ platform }: { platform: Platform }) {
  const cls = "size-full";
  switch (platform) {
    case "Uber Eats":
      return <UberEatsMark className={cls} />;
    case "Deliveroo":
      return <DeliverooMark className={cls} />;
    case "Stuart":
      return <StuartMark className={cls} />;
    case "Amazon Flex":
      return <AmazonMark className={cls} />;
    default:
      return <GenericMark className={cls} />;
  }
}

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

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span
        className="inline-flex shrink-0 items-center justify-center rounded-lg p-[3px] shadow-sm transition-transform duration-200"
        style={{
          width: dim,
          height: dim,
          backgroundColor: brand.bg,
          color: brand.fg,
        }}
        title={brand.label}
        aria-hidden={!showLabel}
      >
        <Mark platform={key} />
      </span>
      {showLabel && (
        <span className="text-xs font-medium text-mg-muted">{brand.label}</span>
      )}
    </span>
  );
}
