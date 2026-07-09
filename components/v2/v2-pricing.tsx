"use client";

import { PricingSection } from "@/components/pricing-section";

type V2PricingProps = {
  onContact: () => void;
};

/** Section tarifs = composant V1 original, isolé du design system V2. */
export function V2Pricing({ onContact }: V2PricingProps) {
  return (
    <div className="v2-pricing-wrap v2-section">
      <div className="v2-wrap">
        <PricingSection onContact={onContact} />
      </div>
    </div>
  );
}
