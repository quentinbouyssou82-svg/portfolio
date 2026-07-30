"use client";

import { JoinBetaCta } from "@/components/margeo/beta/join-beta-cta";

/** CTA fixe mobile pour maximiser la conversion. */
export function LandingStickyCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-mg-border bg-mg-background/90 p-3 backdrop-blur-xl lg:hidden pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <JoinBetaCta />
    </div>
  );
}
