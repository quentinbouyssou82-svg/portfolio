import {
  DRIVEELY_APP_STORE_URL,
  DRIVEELY_PLAY_STORE_URL,
} from "@/lib/margeo/store-links";
import { StoreBadge } from "./store-badges";

/** Mobile-only sticky App Store CTA — visibility toggled by site-landing.js */
export function SiteStickyCta() {
  return (
    <div
      data-site-sticky-cta
      className="site-sticky-cta fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.08] bg-[#09090B]/92 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl sm:hidden"
      aria-hidden="true"
    >
      <div className="mx-auto flex max-w-md items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-[#FAFAFA]">
            Driveely
          </p>
          <p className="truncate text-[11px] text-[#A1A1AA]">
            2 analyses/jour gratuites
          </p>
        </div>
        <StoreBadge
          kind="apple"
          href={DRIVEELY_APP_STORE_URL || null}
          className="shrink-0"
        />
      </div>
    </div>
  );
}
