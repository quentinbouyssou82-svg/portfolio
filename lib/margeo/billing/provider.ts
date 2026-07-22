/**
 * Abstraction paiement.
 * - Bêta : simulated (activation immédiate sans prélèvement)
 * - Production : Stripe uniquement (renouvellement automatique)
 */

import type { DriveelyPlanId } from "@/lib/margeo/plans";

/** Stripe = seul PSP prévu. `simulated` = mode bêta sans facturation réelle. */
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
 * - mode "activate" : activation immédiate (bêta / webhook Stripe déjà traité)
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

/** Bêta : active immédiatement sans paiement réel. auto_renew reste géré côté abonnement. */
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
 * Point d'extension Stripe Checkout.
 * Quand STRIPE_SECRET_KEY est défini, brancher stripePaymentProvider ici.
 * Les abonnements Stripe sont en renouvellement automatique (subscription).
 */
export function getPaymentProvider(): PaymentProvider {
  // Production :
  // if (process.env.STRIPE_SECRET_KEY) return stripePaymentProvider;
  return simulatedPaymentProvider;
}
