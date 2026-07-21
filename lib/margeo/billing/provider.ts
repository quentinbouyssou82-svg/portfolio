/**
 * Abstraction paiement — bêta = simulated.
 * Stripe / LemonSqueezy : implémenter PaymentProvider et brancher via getPaymentProvider().
 */

import type { UberlyPlanId } from "@/lib/margeo/plans";

export type PaymentProviderId = "simulated" | "stripe" | "lemonsqueezy";

export type BillingPeriod = "monthly" | "yearly";

export type CheckoutIntent = {
  userId: string;
  planId: UberlyPlanId;
  billingPeriod: BillingPeriod;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
};

/**
 * Résultat checkout.
 * - mode "activate" : activation immédiate (bêta / webhook déjà traité)
 * - mode "redirect" : rediriger vers provider.checkoutUrl (Stripe Checkout)
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

/** Bêta : active immédiatement sans paiement réel. */
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
 * Point d'extension Stripe :
 * return stripePaymentProvider quand STRIPE_SECRET_KEY est défini.
 */
export function getPaymentProvider(): PaymentProvider {
  // Futur :
  // if (process.env.STRIPE_SECRET_KEY) return stripePaymentProvider;
  return simulatedPaymentProvider;
}
