import type { DriveelyPlanId } from "@/lib/margeo/plans";
import type { BillingPeriod } from "@/lib/margeo/billing/provider";

/** Product IDs StoreKit iOS (ASC) → plan backend Driveely. */
export const IOS_PREMIUM_PRODUCTS: Record<
  string,
  { planId: DriveelyPlanId; billingPeriod: BillingPeriod }
> = {
  "app.driveely.premium.monthly": {
    planId: "pro",
    billingPeriod: "monthly",
  },
  "app.driveely.premium.yearly": {
    planId: "pro",
    billingPeriod: "yearly",
  },
};

export function mapIOSProductId(productId: string): {
  planId: DriveelyPlanId;
  billingPeriod: BillingPeriod;
} | null {
  return IOS_PREMIUM_PRODUCTS[productId] ?? null;
}
