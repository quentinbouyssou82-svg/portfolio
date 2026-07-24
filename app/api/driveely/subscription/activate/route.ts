import { NextResponse } from "next/server";
import { jsonError, ApiError } from "@/lib/margeo/api/errors";
import { requireAuthUser } from "@/lib/margeo/api/auth";
import { getAppFeatures } from "@/lib/margeo/config";
import { checkoutAndActivatePlan } from "@/lib/margeo/services/subscription";
import type { DriveelyPlanId } from "@/lib/margeo/plans";

/** POST — active un plan (production / futur Stripe). */
export async function POST(request: Request) {
  try {
    if (!getAppFeatures().billing) {
      throw new ApiError(
        "Les abonnements sont désactivés dans cet environnement.",
        403,
        "BILLING_DISABLED",
      );
    }

    const user = await requireAuthUser();
    const body = (await request.json().catch(() => ({}))) as {
      planId?: string;
      billingPeriod?: "monthly" | "yearly";
    };

    const planId = body.planId;
    if (planId !== "discovery" && planId !== "pro" && planId !== "elite") {
      throw new ApiError("Plan invalide.", 400, "INVALID_PLAN");
    }

    const result = await checkoutAndActivatePlan(
      user.id,
      planId as DriveelyPlanId,
      { billingPeriod: body.billingPeriod ?? "monthly" },
    );

    if (result.redirectUrl) {
      return NextResponse.json({
        mode: "redirect",
        checkoutUrl: result.redirectUrl,
        subscription: result.subscription,
      });
    }

    return NextResponse.json({
      mode: "activated",
      subscription: result.subscription,
    });
  } catch (error) {
    return jsonError(error);
  }
}
