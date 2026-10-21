/**
 * Abstraction paiement.
 * Pilotée par `getAppFeatures()` — pas de if(beta) dispersés.
 */

import { getBillingFeatures } from "@/lib/margeo/config";
import type { DriveelyPlanId } from "@/lib/margeo/plans";

/** Stripe web (legacy). `app_store` = StoreKit iOS vérifié. `simulated` = dev/bêta uniquement. */
export type PaymentProviderId =
  | "simulated"
  | "stripe"
  | "app_store"
  | "blocked";

export type BillingPeriod = "monthly" | "yearly";

export type CheckoutIntent = {
  userId: string;
  planId: DriveelyPlanId;
  billingPeriod: BillingPeriod;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
};

export type CheckoutResult =
  | {
      mode: "activate";
      provider: PaymentProviderId;
      providerCustomerId?: string | null;
      providerSubscriptionId?: string | null;
      paymentStatus: "simulated" | "paid";
    }
  | {
      mode: "redirect";
      provider: PaymentProviderId;
      checkoutUrl: string;
    }
  | {
      mode: "blocked";
      provider: "blocked";
      message: string;
    };

export interface PaymentProvider {
  id: PaymentProviderId;
  createCheckout(intent: CheckoutIntent): Promise<CheckoutResult>;
}

export const simulatedPaymentProvider: PaymentProvider = {
  id: "simulated",
  async createCheckout(intent) {
    return {
      mode: "activate",
      provider: "simulated",
      providerCustomerId: `sim_cus_${intent.userId.slice(0, 8)}`,
      providerSubscriptionId: `sim_sub_${intent.planId}_${Date.now()}`,
      paymentStatus: "simulated",
    };
  },
};

/** Mode public avant ouverture Stripe — conserve le code, bloque l'achat. */
export const blockedPaymentProvider: PaymentProvider = {
  id: "blocked",
  async createCheckout() {
    return {
      mode: "blocked",
      provider: "blocked",
      message:
        "Ouverture prochaine. Les abonnements seront disponibles dès que le paiement sera finalisé.",
    };
  },
};

/**
 * Provider effectif selon les feature flags.
 * - beta → simulated (billing off en amont)
 * - production sans purchasesEnabled → blocked
 * - production + purchases + STRIPE_SECRET_KEY → Stripe (à brancher)
 * - sinon simulated (dev)
 */
export function getPaymentProvider(): PaymentProvider {
  const feats = getBillingFeatures();
  return resolveProvider(feats);
}

export async function getPaymentProviderAsync(): Promise<PaymentProvider> {
  const { getBillingFeaturesAsync } = await import("@/lib/margeo/config");
  return resolveProvider(await getBillingFeaturesAsync());
}

function isProductionDeploy(): boolean {
  return process.env.VERCEL_ENV === "production";
}

function resolveProvider(feats: ReturnType<typeof getBillingFeatures>): PaymentProvider {
  if (!feats.billing) {
    return simulatedPaymentProvider;
  }
  if (!feats.purchasesEnabled) {
    return blockedPaymentProvider;
  }

  // iOS StoreKit : activation via JWS vérifié (route /subscription/activate).
  // Le provider simulated ne doit jamais activer premium en production.
  if (isProductionDeploy()) {
    return blockedPaymentProvider;
  }

  // Production Stripe web — brancher stripePaymentProvider quand prêt :
  // if (process.env.STRIPE_SECRET_KEY) return stripePaymentProvider;
  return simulatedPaymentProvider;
}

export function isBillingEnabled(): boolean {
  return getBillingFeatures().billing;
}

export function arePurchasesEnabled(): boolean {
  return getBillingFeatures().purchasesEnabled;
}
