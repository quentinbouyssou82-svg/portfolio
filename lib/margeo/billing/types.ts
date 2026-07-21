import type { UberlyPlanId } from "@/lib/margeo/plans";
import type { BillingPeriod, PaymentProviderId } from "@/lib/margeo/billing/provider";

export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "canceled"
  | "past_due"
  | "incomplete"
  | "expired";

export type PaymentStatus =
  | "none"
  | "simulated"
  | "pending"
  | "paid"
  | "failed"
  | "refunded";

export type SubscriptionEventType =
  | "created"
  | "activated"
  | "upgraded"
  | "downgraded"
  | "canceled"
  | "reactivated"
  | "renewed"
  | "expired"
  | "provider_sync";

export interface MargeoSubscriptionRow {
  id: string;
  user_id: string;
  plan_id: UberlyPlanId;
  status: SubscriptionStatus;
  created_at: string;
  started_at: string;
  current_period_start: string;
  current_period_end: string | null;
  canceled_at: string | null;
  cancel_at_period_end: boolean;
  auto_renew: boolean;
  billing_period: BillingPeriod;
  provider: PaymentProviderId | null;
  provider_customer_id: string | null;
  provider_subscription_id: string | null;
  payment_status: PaymentStatus;
  metadata: Record<string, unknown>;
  updated_at: string;
}

export interface MargeoSubscriptionEventRow {
  id: string;
  user_id: string;
  subscription_id: string | null;
  event_type: SubscriptionEventType;
  from_plan: string | null;
  to_plan: string | null;
  from_status: string | null;
  to_status: string | null;
  provider: string | null;
  payload: Record<string, unknown>;
  created_at: string;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: UberlyPlanId;
  status: SubscriptionStatus;
  createdAt: string;
  startedAt: string;
  currentPeriodStart: string;
  currentPeriodEnd: string | null;
  canceledAt: string | null;
  cancelAtPeriodEnd: boolean;
  autoRenew: boolean;
  billingPeriod: BillingPeriod;
  provider: PaymentProviderId | null;
  providerCustomerId: string | null;
  providerSubscriptionId: string | null;
  paymentStatus: PaymentStatus;
}

export interface SubscriptionEvent {
  id: string;
  eventType: SubscriptionEventType;
  fromPlan: UberlyPlanId | null;
  toPlan: UberlyPlanId | null;
  fromStatus: string | null;
  toStatus: string | null;
  provider: string | null;
  createdAt: string;
  payload: Record<string, unknown>;
}

export function rowToSubscription(row: MargeoSubscriptionRow): UserSubscription {
  return {
    id: row.id,
    userId: row.user_id,
    planId: row.plan_id,
    status: row.status,
    createdAt: row.created_at,
    startedAt: row.started_at,
    currentPeriodStart: row.current_period_start,
    currentPeriodEnd: row.current_period_end,
    canceledAt: row.canceled_at,
    cancelAtPeriodEnd: row.cancel_at_period_end,
    autoRenew: row.auto_renew,
    billingPeriod: row.billing_period,
    provider: row.provider,
    providerCustomerId: row.provider_customer_id,
    providerSubscriptionId: row.provider_subscription_id,
    paymentStatus: row.payment_status,
  };
}

export function rowToSubscriptionEvent(
  row: MargeoSubscriptionEventRow,
): SubscriptionEvent {
  return {
    id: row.id,
    eventType: row.event_type,
    fromPlan: (row.from_plan as UberlyPlanId | null) ?? null,
    toPlan: (row.to_plan as UberlyPlanId | null) ?? null,
    fromStatus: row.from_status,
    toStatus: row.to_status,
    provider: row.provider,
    createdAt: row.created_at,
    payload: row.payload ?? {},
  };
}
