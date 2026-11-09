import { cn } from "@/lib/margeo/utils";
import {
  DRIVEELY_APP_STORE_URL,
  DRIVEELY_PLAY_STORE_URL,
} from "@/lib/margeo/store-links";

export type StoreKind = "apple" | "google";

type StoreBadgeProps = {
  kind: StoreKind;
  href: string | null;
  className?: string;
};

export function StoreBadge({ kind, href, className }: StoreBadgeProps) {
  const isApple = kind === "apple";
  const soon = !href;

  const inner = (
    <span
      className={cn(
        "inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-[10px] px-3.5 transition-transform sm:h-11 sm:w-auto sm:justify-start",
        isApple
          ? "bg-[#FAFAFA] text-[#09090B]"
          : "border border-white/12 bg-[#121215] text-[#FAFAFA]",
      )}
    >
      {isApple ? (
        <svg
          className="h-5 w-5 shrink-0"
          viewBox="0 0 24 24"
          aria-hidden
          fill="currentColor"
        >
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
        </svg>
      ) : (
        <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
          <path
            fill="#EA4335"
            d="M3.6 2.2c-.3.2-.5.5-.5.9v17.8c0 .4.2.7.5.9l9.8-9.8L3.6 2.2z"
          />
          <path
            fill="#FBBC04"
            d="M16.1 14.7 13.4 12l-2.7-2.7 2.7-2.7 2.7 2.7 2.7 2.7-2.7 2.7z"
          />
          <path
            fill="#4285F4"
            d="m13.4 12 2.7 2.7 3.6-2.1c.5-.3.5-.9 0-1.2l-3.6-2.1L13.4 12z"
          />
          <path
            fill="#34A853"
            d="M13.4 12 3.6 21.8c.2.1.4.2.7.2.3 0 .5-.1.8-.2l9.1-5.2L13.4 12z"
          />
        </svg>
      )}
      <span className="flex flex-col items-start leading-none">
        <span
          className={cn(
            "text-[9px] font-medium",
            isApple ? "text-black/55" : "text-[#A1A1AA]",
          )}
        >
          {isApple ? "Download on the" : "GET IT ON"}
        </span>
        <span className="mt-0.5 text-[15px] font-semibold tracking-[-0.02em]">
          {isApple ? "App Store" : "Google Play"}
        </span>
      </span>
      {soon ? (
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-semibold",
            isApple ? "bg-black/8 text-black/60" : "bg-white/10 text-[#A1A1AA]",
          )}
        >
          Bientôt
        </span>
      ) : null}
    </span>
  );

  const wrap = cn(
    "inline-flex min-h-11 touch-manipulation focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#818CF8]",
    href ? "hover:opacity-95 active:scale-[0.98]" : "cursor-default",
    className,
  );

  if (href) {
    return (
      <a
        href={href}
        className={wrap}
        data-store={kind}
        rel="noopener noreferrer"
        target="_blank"
        aria-label={isApple ? "App Store" : "Google Play"}
      >
        {inner}
      </a>
    );
  }

  return (
    <span
      className={wrap}
      data-store={kind}
      data-store-ready="false"
      role="img"
      aria-label={`${isApple ? "App Store" : "Google Play"} — bientôt`}
    >
      {inner}
    </span>
  );
}

export function StoreBadgeRow({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex w-full max-w-sm flex-col items-stretch gap-2.5 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-3",
        className,
      )}
    >
      <StoreBadge
        kind="apple"
        href={DRIVEELY_APP_STORE_URL || null}
        className="w-full justify-center sm:w-auto"
      />
      <StoreBadge
        kind="google"
        href={DRIVEELY_PLAY_STORE_URL || null}
        className="w-full justify-center sm:w-auto"
      />
    </div>
  );
}
