"use server";

import type { MargeoActionResult } from "@/lib/margeo/auth/actions";
import type { BetaEventType } from "@/lib/margeo/services/beta-events";
import { logBetaEvent } from "@/lib/margeo/services/beta-events";
import { createMargeoServerClient } from "@/lib/margeo/supabase/server";

const ALLOWED: BetaEventType[] = [
  "paywall_view",
  "paywall_screen",
  "paywall_cta_click",
  "paywall_trial_start",
  "paywall_exit_offer",
  "paywall_dismiss",
];

export async function logPaywallEventAction(input: {
  eventType: BetaEventType;
  metadata?: Record<string, unknown>;
}): Promise<MargeoActionResult> {
  if (!ALLOWED.includes(input.eventType)) {
    return { ok: false, message: "Event non autorisé." };
  }

  const supabase = await createMargeoServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: true };
  }

  await logBetaEvent({
    userId: user.id,
    eventType: input.eventType,
    metadata: input.metadata ?? {},
  });

  return { ok: true };
}
