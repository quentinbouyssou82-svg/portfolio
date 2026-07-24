import { BetaUnlockedPremiumPage } from "@/components/margeo/premium/beta-unlocked-page";
import { PaywallFlow } from "@/components/margeo/paywall/paywall-flow";
import { getAppFeatures } from "@/lib/margeo/config";
import { DRIVEELY_PATHS } from "@/lib/margeo/constants";
import type { PaywallSource } from "@/lib/margeo/paywall/config";
import { getPaywallVariant } from "@/lib/margeo/paywall/variant";
import { getAuthUser } from "@/lib/margeo/auth/session";
import { getCurrentProfile } from "@/lib/margeo/services/profile";
import { redirect } from "next/navigation";

function parseSource(raw: string | string[] | undefined): PaywallSource {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (
    value === "onboarding" ||
    value === "quota" ||
    value === "nav" ||
    value === "banner" ||
    value === "exit" ||
    value === "all_plans"
  ) {
    return value;
  }
  return "direct";
}

export default async function PremiumPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string; step?: string }>;
}) {
  const user = await getAuthUser();
  if (!user) redirect(DRIVEELY_PATHS.login);

  const feats = getAppFeatures();
  if (feats.premiumPageMode === "beta_unlocked" || !feats.paywall) {
    return <BetaUnlockedPremiumPage />;
  }

  const profile = await getCurrentProfile();
  const params = await searchParams;
  const source = parseSource(params.source);
  const variant = getPaywallVariant(user.id);
  const startAtOffer = source === "quota" || params.step === "offer";

  return (
    <PaywallFlow
      profile={profile}
      variant={variant}
      source={source}
      startAtOffer={startAtOffer}
    />
  );
}
