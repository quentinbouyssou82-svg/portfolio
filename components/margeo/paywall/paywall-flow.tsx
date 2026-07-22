"use client";

import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ExitOffer } from "@/components/margeo/paywall/exit-offer";
import { PaywallAllPlansGrid } from "@/components/margeo/paywall/all-plans-grid";
import { PaywallCompareTableScreen } from "@/components/margeo/paywall/screens/compare-table";
import { PaywallOfferScreen } from "@/components/margeo/paywall/screens/offer";
import { PaywallPersonalizedScreen } from "@/components/margeo/paywall/screens/personalized";
import { PaywallVisionScreen } from "@/components/margeo/paywall/screens/vision";
import { usePaywallAnalytics } from "@/components/margeo/paywall/use-paywall-analytics";
import type { BillingPeriod } from "@/lib/margeo/billing/provider";
import {
  PAYWALL_STORAGE_SEEN,
  type PaywallScreen,
  type PaywallSource,
} from "@/lib/margeo/paywall/config";
import { buildPaywallPersonalization } from "@/lib/margeo/paywall/personalize";
import type { PaywallVariant } from "@/lib/margeo/paywall/variant";
import { margeoRoutes } from "@/lib/margeo/routes";
import type { UserProfile } from "@/lib/margeo/types";

const STEPS: PaywallScreen[] = ["vision", "personalized", "offer"];

function markSeen() {
  try {
    localStorage.setItem(PAYWALL_STORAGE_SEEN, "1");
  } catch {
    // ignore
  }
}

export function PaywallFlow({
  profile,
  variant,
  source,
  startAtOffer = false,
}: {
  profile: UserProfile | null;
  variant: PaywallVariant;
  source: PaywallSource;
  /** Skip vision/perso (ex. source=quota) */
  startAtOffer?: boolean;
}) {
  const router = useRouter();
  const perso = useMemo(() => buildPaywallPersonalization(profile), [profile]);
  const analytics = usePaywallAnalytics({ variant, source });

  const [stepIndex, setStepIndex] = useState(startAtOffer ? 2 : 0);
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("yearly");
  const [showAllPlans, setShowAllPlans] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);

  const screen = STEPS[stepIndex] ?? "offer";

  useEffect(() => {
    analytics.view();
    markSeen();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once on mount
  }, []);

  useEffect(() => {
    analytics.screen(showAllPlans ? "offer" : screen);
  }, [analytics, screen, showAllPlans]);

  const goCheckout = (period: BillingPeriod) => {
    analytics.cta({
      plan: "pro",
      billingPeriod: period,
      screen: "offer",
    });
    analytics.trial({ plan: "pro", billingPeriod: period });
    router.push(
      `${margeoRoutes.subscriptionCheckout}?plan=pro&period=${period}&source=${source}`,
    );
  };

  const requestSkip = () => {
    analytics.exit({ screen });
    setExitOpen(true);
  };

  const dismissToDashboard = () => {
    analytics.dismiss({ screen, choice: "free" });
    setExitOpen(false);
    markSeen();
    router.push(margeoRoutes.dashboard);
  };

  if (showAllPlans) {
    return (
      <div className="paywall-flow mx-auto max-w-5xl pb-10">
        <PaywallAllPlansGrid onBack={() => setShowAllPlans(false)} />
      </div>
    );
  }

  return (
    <div className="paywall-flow mx-auto w-full max-w-lg pb-10">
      <div className="paywall-progress mb-8 flex items-center justify-center gap-2">
        {STEPS.map((s, i) => (
          <span
            key={s}
            className={`h-1.5 rounded-full transition-all ${
              i <= stepIndex
                ? "w-8 bg-mg-accent"
                : "w-4 bg-mg-border"
            }`}
            aria-hidden
          />
        ))}
        <span className="sr-only">
          Étape {stepIndex + 1} sur {STEPS.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        {screen === "vision" ? (
          <PaywallVisionScreen
            key="vision"
            perso={perso}
            onContinue={() => setStepIndex(1)}
          />
        ) : null}
        {screen === "personalized" ? (
          <PaywallPersonalizedScreen
            key="perso"
            perso={perso}
            onContinue={() => setStepIndex(2)}
          />
        ) : null}
        {screen === "offer" && variant === "table" ? (
          <PaywallCompareTableScreen
            key="table"
            billingPeriod={billingPeriod}
            onBillingPeriod={setBillingPeriod}
            onCta={() => goCheckout(billingPeriod)}
            onSkip={requestSkip}
            onShowAllPlans={() => setShowAllPlans(true)}
          />
        ) : null}
        {screen === "offer" && variant === "classic" ? (
          <PaywallOfferScreen
            key="offer"
            billingPeriod={billingPeriod}
            onBillingPeriod={setBillingPeriod}
            onCta={() => goCheckout(billingPeriod)}
            onSkip={requestSkip}
            onShowAllPlans={() => setShowAllPlans(true)}
          />
        ) : null}
      </AnimatePresence>

      <ExitOffer
        open={exitOpen}
        onClose={() => setExitOpen(false)}
        onMonthly={() => {
          analytics.exit({ choice: "monthly" });
          setExitOpen(false);
          goCheckout("monthly");
        }}
        onFree={dismissToDashboard}
      />
    </div>
  );
}
