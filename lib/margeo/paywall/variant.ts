export type PaywallVariant = "classic" | "table";

/** A/B stable : hash userId → classic (≈50 %) ou table (≈50 %). */
export function getPaywallVariant(userId: string | null | undefined): PaywallVariant {
  if (!userId) return "classic";
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
  }
  return hash % 2 === 0 ? "classic" : "table";
}
