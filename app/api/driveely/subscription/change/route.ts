import { NextResponse } from "next/server";
import { jsonError, ApiError } from "@/lib/margeo/api/errors";
import { requireAuthUser } from "@/lib/margeo/api/auth";
import { getAppFeatures } from "@/lib/margeo/config";
import { changePlan } from "@/lib/margeo/services/subscription";
import type { DriveelyPlanId } from "@/lib/margeo/plans";

/** POST — upgrade / downgrade */
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
    };
    const planId = body.planId;
    if (planId !== "discovery" && planId !== "pro" && planId !== "elite") {
      throw new ApiError("Plan invalide.", 400, "INVALID_PLAN");
    }

    const subscription = await changePlan(user.id, planId as DriveelyPlanId);
    return NextResponse.json({ subscription });
  } catch (error) {
    return jsonError(error);
  }
}
