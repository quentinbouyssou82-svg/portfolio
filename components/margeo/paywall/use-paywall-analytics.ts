"use client";

import { useCallback } from "react";
import { trackMargeoEvent, type MargeoEvent } from "@/lib/margeo/analytics";
import type { PaywallSource, PaywallScreen } from "@/lib/margeo/paywall/config";
import type { PaywallVariant } from "@/lib/margeo/paywall/variant";
import { logPaywallEventAction } from "@/lib/margeo/actions/paywall-events";

type Props = Record<string, string | number | boolean | null | undefined>;

function toClientProps(props?: Props) {
  if (!props) return undefined;
  const out: Record<string, string | number | boolean | null> = {};
  for (const [k, v] of Object.entries(props)) {
    if (v === undefined) continue;
    out[k] = v;
  }
  return out;
}

export function usePaywallAnalytics(meta: {
  variant: PaywallVariant;
  source: PaywallSource;
}) {
  const track = useCallback(
    (
      event: MargeoEvent,
      betaType:
        | "paywall_view"
        | "paywall_screen"
        | "paywall_cta_click"
        | "paywall_trial_start"
        | "paywall_exit_offer"
        | "paywall_dismiss",
      extra?: Props & { screen?: PaywallScreen },
    ) => {
      const props = {
        variant: meta.variant,
        source: meta.source,
        ...toClientProps(extra),
      };
      trackMargeoEvent(event, props);
      void logPaywallEventAction({
        eventType: betaType,
        metadata: {
          variant: meta.variant,
          source: meta.source,
          ...extra,
        },
      });
    },
    [meta.source, meta.variant],
  );

  return {
    view: () => track("driveely_paywall_view", "paywall_view"),
    screen: (screen: PaywallScreen) =>
      track("driveely_paywall_screen", "paywall_screen", { screen }),
    cta: (extra?: Props) =>
      track("driveely_paywall_cta_click", "paywall_cta_click", extra),
    trial: (extra?: Props) =>
      track("driveely_paywall_trial_start", "paywall_trial_start", extra),
    exit: (extra?: Props) =>
      track("driveely_paywall_exit_offer", "paywall_exit_offer", extra),
    dismiss: (extra?: Props) =>
      track("driveely_paywall_dismiss", "paywall_dismiss", extra),
  };
}
