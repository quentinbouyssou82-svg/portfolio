"use client";

import { Star } from "lucide-react";
import { PAYWALL_COPY } from "@/lib/margeo/paywall/config";

export function PaywallSocialProof() {
  return (
    <figure className="paywall-social rounded-2xl border border-mg-border/80 bg-[var(--mg-surface-muted)] px-4 py-3.5">
      <div className="flex items-center gap-0.5 text-mg-check" aria-label="5 sur 5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="size-3.5 fill-current" aria-hidden />
        ))}
      </div>
      <blockquote className="mt-2 text-sm leading-relaxed text-mg-foreground/90">
        “{PAYWALL_COPY.socialQuote}”
      </blockquote>
      <figcaption className="mt-2 text-[11px] text-mg-faint">
        {PAYWALL_COPY.socialMeta}
      </figcaption>
    </figure>
  );
}
