"use server";

import type { MargeoActionResult } from "@/lib/margeo/auth/actions";
import type { BillingPeriod } from "@/lib/margeo/billing/provider";
import type { PlanEntitlements } from "@/lib/margeo/billing/entitlements";
import type {
  SubscriptionEvent,
  UserSubscription,
} from "@/lib/margeo/billing/types";
import type { DriveelyPlanId } from "@/lib/margeo/plans";
import { DRIVEELY_PLANS } from "@/lib/margeo/plans";
import { createMargeoServerClient } from "@/lib/margeo/supabase/server";
import {
  cancelSubscription,
  cancelSubscriptionImmediately,
  changePlan,
  checkoutAndActivatePlan,
  getCurrentSubscription,
  getUserEntitlements,
  listSubscriptionHistory,
} from "@/lib/margeo/services/subscription";
import { trackMargeoEvent } from "@/lib/margeo/analytics";

async function requireUserId(): Promise<
  { ok: true; userId: string } | { ok: false; message: string }
> {
  const supabase = await createMargeoServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Non authentifié." };
  return { ok: true, userId: user.id };
}

function assertPlanId(planId: string): planId is DriveelyPlanId {
  return planId === "discovery" || planId === "pro" || planId === "elite";
}

export async function getSubscriptionAction(): Promise<
  MargeoActionResult<{
    subscription: UserSubscription;
    entitlements: PlanEntitlements;
  }>
> {
  const auth = await requireUserId();
  if (!auth.ok) return auth;
  const subscription = await getCurrentSubscription(auth.userId);
  const entitlements = await getUserEntitlements(auth.userId);
  return { ok: true, data: { subscription, entitlements } };
}

export async function getSubscriptionHistoryAction(): Promise<
  MargeoActionResult<SubscriptionEvent[]>
> {
  const auth = await requireUserId();
  if (!auth.ok) return auth;
  const history = await listSubscriptionHistory(auth.userId);
  return { ok: true, data: history };
}

/**
 * Active un plan (bêta = paiement simulé).
 * Remplacer getPaymentProvider() pour brancher Stripe sans changer cet API.
 */
export async function activatePlanAction(input: {
  planId: string;
  billingPeriod?: BillingPeriod;
}): Promise<
  MargeoActionResult<{ subscription: UserSubscription; redirectUrl?: string }>
> {
  const auth = await requireUserId();
  if (!auth.ok) return auth;
  if (!assertPlanId(input.planId)) {
    return { ok: false, message: "Plan invalide." };
  }
  if (!(input.planId in DRIVEELY_PLANS)) {
    return { ok: false, message: "Plan inconnu." };
  }

  try {
    const result = await checkoutAndActivatePlan(auth.userId, input.planId, {
      billingPeriod: input.billingPeriod ?? "monthly",
    });
    trackMargeoEvent("margeo_subscription_activated", {
      plan: input.planId,
    });
    return { ok: true, data: result };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Activation impossible.",
    };
  }
}

export async function changePlanAction(input: {
  planId: string;
}): Promise<MargeoActionResult<UserSubscription>> {
  const auth = await requireUserId();
  if (!auth.ok) return auth;
  if (!assertPlanId(input.planId)) {
    return { ok: false, message: "Plan invalide." };
  }
  try {
    const subscription = await changePlan(auth.userId, input.planId);
    trackMargeoEvent("margeo_subscription_changed", { plan: input.planId });
    return { ok: true, data: subscription };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Changement de plan impossible.",
    };
  }
}

export async function cancelSubscriptionAction(input?: {
  immediate?: boolean;
}): Promise<MargeoActionResult<UserSubscription>> {
  const auth = await requireUserId();
  if (!auth.ok) return auth;
  try {
    const subscription = input?.immediate
      ? await cancelSubscriptionImmediately(auth.userId)
      : await cancelSubscription(auth.userId);
    trackMargeoEvent("margeo_subscription_canceled", {
      immediate: Boolean(input?.immediate),
    });
    return { ok: true, data: subscription };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Annulation impossible.",
    };
  }
}
