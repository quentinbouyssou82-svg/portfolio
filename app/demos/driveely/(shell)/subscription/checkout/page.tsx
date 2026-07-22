import { CheckoutView } from "@/components/margeo/subscription/checkout-view";
import type { DriveelyPlanId } from "@/lib/margeo/plans";
import { DRIVEELY_PATHS } from "@/lib/margeo/constants";
import { getAuthUser } from "@/lib/margeo/auth/session";
import { redirect } from "next/navigation";

function parsePlan(raw: string | string[] | undefined): DriveelyPlanId {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value === "pro" || value === "elite" || value === "discovery") return value;
  return "pro";
}

export default async function SubscriptionCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const user = await getAuthUser();
  if (!user) redirect(DRIVEELY_PATHS.login);

  const params = await searchParams;
  const planId = parsePlan(params.plan);

  return <CheckoutView planId={planId} />;
}
