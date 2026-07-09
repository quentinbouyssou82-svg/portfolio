import { NextResponse } from "next/server";
import { jsonError } from "@/lib/margeo/api/errors";
import { requireAuthUser } from "@/lib/margeo/api/auth";
import { getQuotaStatus } from "@/lib/margeo/services/quota";
import { resolvePremiumStatus } from "@/lib/margeo/services/premium";
import { getProfileForUser } from "@/lib/margeo/services/profile";
import { UBERLY_LIMITS } from "@/lib/margeo/constants/limits";

/** Statut plan + quotas — contrat stable pour le frontend. */
export async function GET() {
  try {
    const user = await requireAuthUser();
    const profile = await getProfileForUser(user.id);
    const quota = await getQuotaStatus(user.id);
    const premium = profile ? resolvePremiumStatus(profile) : null;

    return NextResponse.json({
      quota,
      premium,
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
