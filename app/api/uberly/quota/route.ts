import { NextResponse } from "next/server";
import { jsonError } from "@/lib/margeo/api/errors";
import { requireAuthUser } from "@/lib/margeo/api/auth";
import { getQuotaStatus } from "@/lib/margeo/services/quota";
import { resolvePremiumStatusForUser } from "@/lib/margeo/services/premium";
import { getUserEntitlements } from "@/lib/margeo/services/subscription";
import { UBERLY_LIMITS } from "@/lib/margeo/constants/limits";

/** Statut plan + quotas + entitlements — contrat stable pour le frontend. */
export async function GET() {
  try {
    const user = await requireAuthUser();
    const [quota, premium, entitlements] = await Promise.all([
      getQuotaStatus(user.id),
      resolvePremiumStatusForUser(user.id),
      getUserEntitlements(user.id),
    ]);

    return NextResponse.json({
      quota,
      premium,
      entitlements,
      limits: {
        freeDailyAnalyses: UBERLY_LIMITS.freeDailyAnalyses,
        freeHistoryDays: UBERLY_LIMITS.freeHistoryDays,
        maxImageBytes: UBERLY_LIMITS.maxImageBytes,
      },
    });
  } catch (error) {
    return jsonError(error);
  }
}
