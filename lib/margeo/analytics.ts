"use client";

import posthog from "posthog-js";

export type MargeoEvent =
  | "margeo_account_created"
  | "margeo_first_analysis"
  | "margeo_image_uploaded"
  | "margeo_result_displayed"
  | "margeo_feedback_submitted"
  | "margeo_onboarding_completed"
  | "margeo_profile_updated"
  | "margeo_subscription_activated"
  | "margeo_subscription_changed"
  | "margeo_subscription_canceled";

const FUNNEL_STEPS = [
  "visitor",
  "account_created",
  "first_analysis",
  "active_user",
] as const;

export type FunnelStep = (typeof FUNNEL_STEPS)[number];

export function trackMargeoEvent(
  event: MargeoEvent,
  properties?: Record<string, string | number | boolean | null>,
) {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  posthog.capture(event, properties);
}

export function identifyMargeoUser(
  userId: string,
  traits?: Record<string, string | number | boolean>,
) {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  posthog.identify(userId, traits);
}

export function trackFunnelStep(
  step: FunnelStep,
  properties?: Record<string, string | number | boolean>,
) {
  trackMargeoEvent("margeo_result_displayed", {
    funnel_step: step,
    ...properties,
  });
}

export function maybeMarkActiveUser(analysisCount: number, userId: string) {
  if (analysisCount >= 3) {
    trackFunnelStep("active_user", { user_id: userId, analysis_count: analysisCount });
  }
}
