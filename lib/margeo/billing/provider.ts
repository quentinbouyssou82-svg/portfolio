/**
 * Abstraction paiement.
 * Pilotée par `getAppFeatures()` — pas de if(beta) dispersés.
 */

import { getAppFeatures } from "@/lib/margeo/config";
import type { DriveelyPlanId } from "@/lib/margeo/plans";

/** Stripe = seul PSP prévu. `simulated` = sans facturation réelle. */
export type PaymentProviderId = "simulated" | "stripe";

export type BillingPeriod = "monthly" | "yearly";

export type CheckoutIntent = {
  userId: string;
  planId: DriveelyPlanId;
  billingPeriod: BillingPeriod;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
};

/**
 * Résultat checkout.
 * - mode "activate" : activation immédiate (bêta app / webhook Stripe déjà traité)
 * - mode "redirect" : rediriger vers Stripe Checkout
 */
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
    };

export interface PaymentProvider {
  id: PaymentProviderId;
  createCheckout(intent: CheckoutIntent): Promise<CheckoutResult>;
}

/** Activation immédiate sans prélèvement. */
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

/**
 * Provider effectif selon l'environnement.
 * - beta app / billing off → simulated
 * - production + STRIPE_SECRET_KEY + stripe flag → Stripe (à brancher)
 * - sinon simulated
 */
export function getPaymentProvider(): PaymentProvider {
  const feats = getAppFeatures();
  if (!feats.billing || !feats.stripe) {
    return simulatedPaymentProvider;
  }

  // Production Stripe — brancher stripePaymentProvider quand prêt :
  // if (process.env.STRIPE_SECRET_KEY) return stripePaymentProvider;
  return simulatedPaymentProvider;
}

export function isBillingEnabled(): boolean {
  return getAppFeatures().billing;
}
