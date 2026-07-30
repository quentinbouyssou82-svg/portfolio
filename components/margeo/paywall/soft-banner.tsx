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
    <div className="paywall-soft-banner" role="region" aria-label="Offre Pro">
      <span className="paywall-soft-banner-icon" aria-hidden>
        <Crown className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold tracking-tight text-mg-foreground">
          Analyses illimitées pendant 14 jours
        </p>
        <p className="mt-0.5 text-xs leading-relaxed text-mg-muted">
          Essai Pro offert — sans engagement. Annule quand tu veux.
        </p>
        <Link
          href={`${margeoRoutes.premium}?source=banner`}
          className="mt-2.5 inline-block"
        >
          <Button size="sm" variant="secondary" className="min-h-9">
            Voir l&apos;offre
          </Button>
        </Link>
      </div>
      <button
        type="button"
        className="paywall-soft-banner-dismiss"
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
