"use client";

import { Crown, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/margeo/ui/button";
import { getAppFeatures } from "@/lib/margeo/config";
import { PAYWALL_STORAGE_BANNER_DISMISS } from "@/lib/margeo/paywall/config";
import { margeoRoutes } from "@/lib/margeo/routes";

/** Banner soft dashboard pour utilisateurs free (dismissable). Inactif en app bêta. */
export function PaywallSoftBanner({
  isFreePlan,
}: {
  isFreePlan: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const showCommercial = getAppFeatures().paywallSoftBanner;

  useEffect(() => {
    if (!showCommercial || !isFreePlan) return;
    try {
      if (localStorage.getItem(PAYWALL_STORAGE_BANNER_DISMISS) === "1") return;
    } catch {
      // ignore
    }
    setVisible(true);
  }, [isFreePlan, showCommercial]);

  if (!showCommercial || !visible) return null;

  return (
    <div className="paywall-soft-banner flex items-start gap-3 rounded-2xl border border-mg-accent/25 bg-mg-accent-soft/40 px-4 py-3.5">
      <Crown className="mt-0.5 size-4 shrink-0 text-mg-accent" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-mg-foreground">
          Ton plan personnalisé est prêt
        </p>
        <p className="mt-0.5 text-xs leading-relaxed text-mg-muted">
          14 jours Pro offerts — analyses illimitées, sans engagement.
        </p>
        <Link
          href={`${margeoRoutes.premium}?source=banner`}
          className="mt-2.5 inline-block"
        >
          <Button size="sm" className="landing-cta-primary min-h-9">
            Voir mon offre →
          </Button>
        </Link>
      </div>
      <button
        type="button"
        className="flex size-9 shrink-0 items-center justify-center rounded-xl text-mg-faint transition hover:text-mg-foreground"
        aria-label="Masquer"
        onClick={() => {
          try {
            localStorage.setItem(PAYWALL_STORAGE_BANNER_DISMISS, "1");
          } catch {
            // ignore
          }
          setVisible(false);
        }}
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
