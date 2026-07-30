import {
  getEntitlementsForPlanAsync,
  isPaidPlan,
  planRank,
  type PlanEntitlements,
} from "@/lib/margeo/billing/entitlements";
import {
  getPaymentProviderAsync,
  type BillingPeriod,
  type PaymentProviderId,
} from "@/lib/margeo/billing/provider";
import {
  rowToSubscription,
  rowToSubscriptionEvent,
  type MargeoSubscriptionEventRow,
  type MargeoSubscriptionRow,
  type PaymentStatus,
  type SubscriptionEvent,
  type SubscriptionEventType,
  type SubscriptionStatus,
  type UserSubscription,
} from "@/lib/margeo/billing/types";
import type { DriveelyPlanId } from "@/lib/margeo/plans";
import { createMargeoServerClient } from "@/lib/margeo/supabase/server";
import { getMargeoAdminDb } from "@/lib/margeo/supabase/admin";
import {
  getProfileForUser,
  rowToUserProfile,
} from "@/lib/margeo/services/profile";
import type { MargeoProfileRow } from "@/lib/margeo/supabase/schema";

const ENTITLEMENTS_TTL_MS = 60_000;
const entitlementsCache = new Map<
  string,
  { value: PlanEntitlements; expires: number }
>();

/** Invalide le cache après activation / changement / annulation de plan. */
export function invalidateEntitlementsCache(userId?: string): void {
  if (userId) {
    entitlementsCache.delete(userId);
    return;
  }
  entitlementsCache.clear();
}

function db() {
  // Service role : RLS contourné après requireAuthUser / actions authentifiées
  try {
    return getMargeoAdminDb();
  } catch {
    // Fallback cookie client (dev sans secret)
    return null;
  }
}

async function userDb() {
  const admin = db();
  if (admin) return admin;
  return createMargeoServerClient();
}

async function loadProfile(userId: string) {
  const admin = db();
  if (admin) {
    const { data } = await admin
      .from("margeo_profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (data) return rowToUserProfile(data as MargeoProfileRow);
  }
  return getProfileForUser(userId);
}

const PERIOD_DAYS = 30;

function addDays(iso: string | Date, days: number): string {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}

function isMissingRelation(error: { message?: string; code?: string } | null) {
  if (!error) return false;
  const msg = (error.message ?? "").toLowerCase();
  return (
    error.code === "42P01" ||
    msg.includes("does not exist") ||
    msg.includes("schema cache") ||
    msg.includes("could not find the table")
  );
}

function isMissingColumn(error: { message?: string; code?: string } | null) {
  if (!error) return false;
  const msg = (error.message ?? "").toLowerCase();
  return (
    error.code === "42703" ||
    msg.includes("column") && msg.includes("does not exist") ||
    msg.includes("schema cache")
  );
}

function discoveryFallback(userId: string): UserSubscription {
  const now = new Date().toISOString();
  return {
    id: `local-${userId}`,
    userId,
    planId: "discovery",
    status: "active",
    createdAt: now,
    startedAt: now,
    currentPeriodStart: now,
    currentPeriodEnd: null,
    canceledAt: null,
    cancelAtPeriodEnd: false,
    autoRenew: false,
    billingPeriod: "monthly",
    provider: null,
    providerCustomerId: null,
    providerSubscriptionId: null,
    paymentStatus: "none",
  };
}

function fromLegacyProfile(
  userId: string,
  profile: {
    premium: boolean;
    premiumUntil?: string;
    premiumSource?: string;
    planId?: DriveelyPlanId;
  },
): UserSubscription {
  const now = new Date().toISOString();
  const planId: DriveelyPlanId =
    profile.planId && ["discovery", "pro", "elite"].includes(profile.planId)
      ? profile.planId
      : profile.premium
        ? "pro"
        : "discovery";

  const expired =
    profile.premiumUntil != null &&
    new Date(profile.premiumUntil).getTime() < Date.now();

  if (expired || (!profile.premium && planId === "discovery")) {
    return discoveryFallback(userId);
  }

  return {
    id: `legacy-${userId}`,
    userId,
    planId,
    status: "active",
    createdAt: now,
    startedAt: now,
    currentPeriodStart: now,
    currentPeriodEnd: profile.premiumUntil ?? null,
    canceledAt: null,
    cancelAtPeriodEnd: false,
    autoRenew: isPaidPlan(planId),
    billingPeriod: "monthly",
    provider:
      profile.premiumSource === "stripe"
        ? "stripe"
        : profile.premium
          ? "simulated"
          : null,
    providerCustomerId: null,
    providerSubscriptionId: null,
    paymentStatus: profile.premium ? "simulated" : "none",
  };
}

async function syncProfilePlan(
  userId: string,
  planId: DriveelyPlanId,
  periodEnd: string | null,
  source: "manual" | "beta" | "stripe" | "trial",
) {
  const supabase = await userDb();
  const paid = isPaidPlan(planId);
  const payload: Record<string, unknown> = {
    premium: paid,
    premium_until: paid ? periodEnd : null,
    premium_source: paid ? source : null,
    plan_id: planId,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("margeo_profiles")
    .update(payload)
    .eq("id", userId);

  if (isMissingColumn(error)) {
    await supabase
      .from("margeo_profiles")
      .update({
        premium: paid,
        premium_until: paid ? periodEnd : null,
        premium_source: paid ? source : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);
  }

  // Miroir auth metadata (fallback Elite sans colonne plan_id)
  try {
    const admin = getMargeoAdminDb();
    const { data } = await admin.auth.admin.getUserById(userId);
    const prev = (data.user?.user_metadata ?? {}) as Record<string, unknown>;
    await admin.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...prev,
        plan_id: planId,
        premium: paid,
        premium_until: paid ? periodEnd : null,
      },
    });
  } catch {
    // ignore
  }
}

async function appendEvent(input: {
  userId: string;
  subscriptionId: string | null;
  eventType: SubscriptionEventType;
  fromPlan: DriveelyPlanId | null;
  toPlan: DriveelyPlanId | null;
  fromStatus: string | null;
  toStatus: string | null;
  provider: string | null;
  payload?: Record<string, unknown>;
}) {
  const supabase = await userDb();
  const { error } = await supabase.from("margeo_subscription_events").insert({
    user_id: input.userId,
    subscription_id: input.subscriptionId,
    event_type: input.eventType,
    from_plan: input.fromPlan,
    to_plan: input.toPlan,
    from_status: input.fromStatus,
    to_status: input.toStatus,
    provider: input.provider,
    payload: input.payload ?? {},
  });
  if (error && !isMissingRelation(error)) {
    console.error("[driveely/subscription] event insert:", error.message);
  }

  // Fallback historique dans auth metadata si table absente
  if (isMissingRelation(error)) {
    try {
      const admin = getMargeoAdminDb();
      const { data } = await admin.auth.admin.getUserById(input.userId);
      const prev = (data.user?.user_metadata ?? {}) as Record<string, unknown>;
      const existing = Array.isArray(prev.subscription_events)
        ? (prev.subscription_events as Record<string, unknown>[])
        : [];
      const entry = {
        id: `meta-${Date.now()}`,
        event_type: input.eventType,
        from_plan: input.fromPlan,
        to_plan: input.toPlan,
        from_status: input.fromStatus,
        to_status: input.toStatus,
        provider: input.provider,
        payload: input.payload ?? {},
        created_at: new Date().toISOString(),
      };
      await admin.auth.admin.updateUserById(input.userId, {
        user_metadata: {
          ...prev,
          subscription_events: [entry, ...existing].slice(0, 40),
        },
      });
    } catch {
      // ignore
    }
  }
}

function resolveEffectivePlan(sub: UserSubscription): DriveelyPlanId {
  if (sub.status === "expired" || sub.status === "canceled") {
    return "discovery";
  }
  if (
    sub.cancelAtPeriodEnd &&
    sub.currentPeriodEnd &&
    new Date(sub.currentPeriodEnd).getTime() < Date.now()
  ) {
    return "discovery";
  }
  if (
    isPaidPlan(sub.planId) &&
    sub.currentPeriodEnd &&
    new Date(sub.currentPeriodEnd).getTime() < Date.now() &&
    !sub.autoRenew
  ) {
    return "discovery";
  }
  return sub.planId;
}

export async function getCurrentSubscription(
  userId: string,
): Promise<UserSubscription> {
  const supabase = await userDb();
  const { data, error } = await supabase
    .from("margeo_subscriptions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  // Prefer metadata plan when subscriptions table / plan_id column manquent
  if (isMissingRelation(error)) {
    const profile = await loadProfile(userId);
    if (!profile) return discoveryFallback(userId);
    let planId = profile.planId;
    try {
      const admin = getMargeoAdminDb();
      const { data: userData } = await admin.auth.admin.getUserById(userId);
      const meta = userData.user?.user_metadata as
        | {
            plan_id?: string;
            premium?: boolean;
            premium_until?: string;
            premium_source?: string;
          }
        | undefined;
      const metaPlan = meta?.plan_id;
      if (
        metaPlan === "discovery" ||
        metaPlan === "pro" ||
        metaPlan === "elite"
      ) {
        planId = metaPlan;
      }
      // Metadata premium sans plan_id explicite
      if (
        planId === "discovery" &&
        (meta?.premium === true || profile.premium)
      ) {
        planId = "pro";
      }
      return fromLegacyProfile(userId, {
        premium:
          profile.premium ||
          meta?.premium === true ||
          planId === "pro" ||
          planId === "elite",
        premiumUntil: profile.premiumUntil ?? meta?.premium_until,
        premiumSource:
          (profile.premiumSource as
            | "manual"
            | "beta"
            | "stripe"
            | "trial"
            | undefined) ??
          (meta?.premium_source as
            | "manual"
            | "beta"
            | "stripe"
            | "trial"
            | undefined),
        planId,
      });
    } catch {
      // ignore
    }
    return fromLegacyProfile(userId, {
      premium: profile.premium,
      premiumUntil: profile.premiumUntil,
      premiumSource: profile.premiumSource,
      planId,
    });
  }

  if (error || !data) {
    const profile = await loadProfile(userId);
    if (profile) {
      return fromLegacyProfile(userId, {
        premium: profile.premium,
        premiumUntil: profile.premiumUntil,
        premiumSource: profile.premiumSource,
        planId: profile.planId,
      });
    }
    return discoveryFallback(userId);
  }

  const sub = rowToSubscription(data as MargeoSubscriptionRow);
  const effective = resolveEffectivePlan(sub);
  if (effective !== sub.planId) {
    // Période expirée → ramener à Découverte
    return upsertSubscription(userId, {
      planId: "discovery",
      status: "expired",
      autoRenew: false,
      cancelAtPeriodEnd: false,
      paymentStatus: "none",
      provider: sub.provider,
      eventType: "expired",
      fromPlan: sub.planId,
    });
  }
  return sub;
}

export async function getUserEntitlements(
  userId: string,
): Promise<PlanEntitlements> {
  const cached = entitlementsCache.get(userId);
  if (cached && Date.now() < cached.expires) return cached.value;

  const sub = await getCurrentSubscription(userId);
  const value = await getEntitlementsForPlanAsync(resolveEffectivePlan(sub));
  entitlementsCache.set(userId, {
    value,
    expires: Date.now() + ENTITLEMENTS_TTL_MS,
  });
  return value;
}

export async function listSubscriptionHistory(
  userId: string,
  limit = 50,
): Promise<SubscriptionEvent[]> {
  const supabase = await userDb();
  const { data, error } = await supabase
    .from("margeo_subscription_events")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (!error && data) {
    return (data as MargeoSubscriptionEventRow[]).map(rowToSubscriptionEvent);
  }

  if (error && !isMissingRelation(error)) {
    console.error("[driveely/subscription] history:", error.message);
  }

  // Fallback metadata
  try {
    const admin = getMargeoAdminDb();
    const { data: userData } = await admin.auth.admin.getUserById(userId);
    const events = userData.user?.user_metadata?.subscription_events;
    if (Array.isArray(events)) {
      return events.slice(0, limit).map((raw) => {
        const row = raw as Record<string, unknown>;
        return rowToSubscriptionEvent({
          id: String(row.id ?? `meta-${row.created_at}`),
          user_id: userId,
          subscription_id: null,
          event_type: row.event_type as MargeoSubscriptionEventRow["event_type"],
          from_plan: (row.from_plan as string | null) ?? null,
          to_plan: (row.to_plan as string | null) ?? null,
          from_status: (row.from_status as string | null) ?? null,
          to_status: (row.to_status as string | null) ?? null,
          provider: (row.provider as string | null) ?? null,
          payload: (row.payload as Record<string, unknown>) ?? {},
          created_at: String(row.created_at ?? new Date().toISOString()),
        });
      });
    }
  } catch {
    // ignore
  }

  return [];
}

type UpsertInput = {
  planId: DriveelyPlanId;
  status: SubscriptionStatus;
  autoRenew: boolean;
  cancelAtPeriodEnd: boolean;
  paymentStatus: PaymentStatus;
  provider: PaymentProviderId | null;
  providerCustomerId?: string | null;
  providerSubscriptionId?: string | null;
  billingPeriod?: BillingPeriod;
  periodEnd?: string | null;
  eventType: SubscriptionEventType;
  fromPlan: DriveelyPlanId | null;
  metadata?: Record<string, unknown>;
};

async function upsertSubscription(
  userId: string,
  input: UpsertInput,
): Promise<UserSubscription> {
  const supabase = await userDb();
  const now = new Date().toISOString();
  const paid = isPaidPlan(input.planId);
  const periodEnd =
    input.periodEnd !== undefined
      ? input.periodEnd
      : paid
        ? addDays(now, PERIOD_DAYS)
        : null;

  const existing = await supabase
    .from("margeo_subscriptions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  const fromStatus =
    existing.data != null
      ? (existing.data as MargeoSubscriptionRow).status
      : null;
  const fromPlan =
    input.fromPlan ??
    (existing.data
      ? (existing.data as MargeoSubscriptionRow).plan_id
      : null);

  const row = {
    user_id: userId,
    plan_id: input.planId,
    status: input.status,
    started_at:
      existing.data &&
      (existing.data as MargeoSubscriptionRow).plan_id === input.planId
        ? (existing.data as MargeoSubscriptionRow).started_at
        : now,
    current_period_start: now,
    current_period_end: periodEnd,
    canceled_at:
      input.status === "canceled" || input.cancelAtPeriodEnd ? now : null,
    cancel_at_period_end: input.cancelAtPeriodEnd,
    auto_renew: input.autoRenew,
    billing_period: input.billingPeriod ?? "monthly",
    provider: input.provider,
    provider_customer_id: input.providerCustomerId ?? null,
    provider_subscription_id: input.providerSubscriptionId ?? null,
    payment_status: input.paymentStatus,
    metadata: input.metadata ?? {},
    updated_at: now,
  };

  let saved: MargeoSubscriptionRow | null = null;

  if (isMissingRelation(existing.error)) {
    // Tables absentes : sync profil + historique metadata
    await syncProfilePlan(
      userId,
      input.planId,
      periodEnd,
      input.provider === "stripe" ? "stripe" : "trial",
    );
    await appendEvent({
      userId,
      subscriptionId: null,
      eventType: input.eventType,
      fromPlan,
      toPlan: input.planId,
      fromStatus,
      toStatus: input.status,
      provider: input.provider,
      payload: input.metadata,
    });
    invalidateEntitlementsCache(userId);
    return {
      ...discoveryFallback(userId),
      planId: input.planId,
      status: input.status,
      currentPeriodEnd: periodEnd,
      autoRenew: input.autoRenew,
      cancelAtPeriodEnd: input.cancelAtPeriodEnd,
      provider: input.provider,
      paymentStatus: input.paymentStatus,
      providerCustomerId: input.providerCustomerId ?? null,
      providerSubscriptionId: input.providerSubscriptionId ?? null,
    };
  }

  if (existing.data) {
    const { data, error } = await supabase
      .from("margeo_subscriptions")
      .update(row)
      .eq("user_id", userId)
      .select("*")
      .single();
    if (error) {
      console.error("[driveely/subscription] update:", error.message);
      throw new Error("Impossible de mettre à jour l'abonnement.");
    }
    saved = data as MargeoSubscriptionRow;
  } else {
    const { data, error } = await supabase
      .from("margeo_subscriptions")
      .insert(row)
      .select("*")
      .single();
    if (error) {
      console.error("[driveely/subscription] insert:", error.message);
      throw new Error("Impossible de créer l'abonnement.");
    }
    saved = data as MargeoSubscriptionRow;
  }

  await syncProfilePlan(
    userId,
    input.planId,
    periodEnd,
    input.provider === "stripe" ? "stripe" : "trial",
  );

  await appendEvent({
    userId,
    subscriptionId: saved.id,
    eventType: input.eventType,
    fromPlan,
    toPlan: input.planId,
    fromStatus,
    toStatus: input.status,
    provider: input.provider,
    payload: input.metadata,
  });

  invalidateEntitlementsCache(userId);
  return rowToSubscription(saved);
}

/**
 * Active un plan via le provider de paiement.
 * - Bêta : simulated (activation immédiate)
 * - Production : Stripe Checkout + abonnement à renouvellement automatique
 */
export async function checkoutAndActivatePlan(
  userId: string,
  planId: DriveelyPlanId,
  options?: {
    billingPeriod?: BillingPeriod;
    successUrl?: string;
    cancelUrl?: string;
    customerEmail?: string;
  },
): Promise<{ subscription: UserSubscription; redirectUrl?: string }> {
  const current = await getCurrentSubscription(userId);
  const provider = await getPaymentProviderAsync();
  const checkout = await provider.createCheckout({
    userId,
    planId,
    billingPeriod: options?.billingPeriod ?? "monthly",
    successUrl: options?.successUrl ?? "",
    cancelUrl: options?.cancelUrl ?? "",
    customerEmail: options?.customerEmail,
  });

  if (checkout.mode === "redirect") {
    return { subscription: current, redirectUrl: checkout.checkoutUrl };
  }

  if (checkout.mode === "blocked") {
    throw new Error(checkout.message);
  }

  const rankDelta = planRank(planId) - planRank(current.planId);
  const eventType: SubscriptionEventType =
    current.planId === "discovery" && planId !== "discovery"
      ? "activated"
      : rankDelta > 0
        ? "upgraded"
        : rankDelta < 0
          ? "downgraded"
          : "reactivated";

  const subscription = await upsertSubscription(userId, {
    planId,
    status: planId === "discovery" ? "active" : "trialing",
    autoRenew: isPaidPlan(planId),
    cancelAtPeriodEnd: false,
    paymentStatus: checkout.paymentStatus,
    provider: checkout.provider,
    providerCustomerId: checkout.providerCustomerId,
    providerSubscriptionId: checkout.providerSubscriptionId,
    billingPeriod: options?.billingPeriod ?? "monthly",
    eventType,
    fromPlan: current.planId,
    metadata: { checkoutMode: "activate", beta: true },
  });

  return { subscription };
}

export async function changePlan(
  userId: string,
  planId: DriveelyPlanId,
): Promise<UserSubscription> {
  const result = await checkoutAndActivatePlan(userId, planId);
  return result.subscription;
}

/** Annulation : fin de période (auto_renew off). Accès conservé jusqu'à period_end. */
export async function cancelSubscription(
  userId: string,
): Promise<UserSubscription> {
  const current = await getCurrentSubscription(userId);
  if (!isPaidPlan(current.planId)) {
    return current;
  }

  const periodEnd =
    current.currentPeriodEnd ?? addDays(new Date().toISOString(), PERIOD_DAYS);

  return upsertSubscription(userId, {
    planId: current.planId,
    status: "active",
    autoRenew: false,
    cancelAtPeriodEnd: true,
    paymentStatus: current.paymentStatus,
    provider: current.provider,
    providerCustomerId: current.providerCustomerId,
    providerSubscriptionId: current.providerSubscriptionId,
    periodEnd,
    eventType: "canceled",
    fromPlan: current.planId,
    metadata: { cancelAtPeriodEnd: true },
  });
}

/** Annulation immédiate → Découverte. */
export async function cancelSubscriptionImmediately(
  userId: string,
): Promise<UserSubscription> {
  const current = await getCurrentSubscription(userId);
  return upsertSubscription(userId, {
    planId: "discovery",
    status: "canceled",
    autoRenew: false,
    cancelAtPeriodEnd: false,
    paymentStatus: "none",
    provider: current.provider,
    periodEnd: null,
    eventType: "canceled",
    fromPlan: current.planId,
    metadata: { immediate: true },
  });
}

export async function assertEntitlement(
  userId: string,
  flag: keyof PlanEntitlements,
): Promise<PlanEntitlements> {
  const entitlements = await getUserEntitlements(userId);
  const value = entitlements[flag];
  if (value === false) {
    const { ApiError } = await import("@/lib/margeo/api/errors");
    throw new ApiError(
      "Fonctionnalité réservée à un plan supérieur.",
      403,
      "PLAN_FORBIDDEN",
    );
  }
  return entitlements;
}
