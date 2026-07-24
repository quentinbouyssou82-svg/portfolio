import { NextResponse } from "next/server";
import { jsonError } from "@/lib/margeo/api/errors";
import { requireAuthUser } from "@/lib/margeo/api/auth";
import { getAppFeatures, getAppMode } from "@/lib/margeo/config";
import { getQuotaStatus } from "@/lib/margeo/services/quota";
import { resolvePremiumStatusForUser } from "@/lib/margeo/services/premium";
import { getUserEntitlements } from "@/lib/margeo/services/subscription";
import { DRIVEELY_LIMITS } from "@/lib/margeo/constants/limits";

/** Statut plan + quotas + entitlements — contrat stable pour le frontend. */
export async function GET() {
  try {
    const user = await requireAuthUser();
    const feats = getAppFeatures();
    const [quota, premium, entitlements] = await Promise.all([
      getQuotaStatus(user.id),
      resolvePremiumStatusForUser(user.id),
      getUserEntitlements(user.id),
    ]);

    return NextResponse.json({
      appMode: getAppMode(),
      billingEnabled: feats.billing,
      freemiumLimits: feats.freemiumLimits,
      /**
       * quota.premium = analyses illimitées effectives (peut venir du mode bêta).
       * premium.isPremium = abonnement réel uniquement.
       * premium.effectivePremium = accès effectif (abo OU app_mode).
       */
      quota,
      premium,
      entitlements,
      limits: {
        freeDailyAnalyses: DRIVEELY_LIMITS.freeDailyAnalyses,
        freeHistoryDays: DRIVEELY_LIMITS.freeHistoryDays,
        maxImageBytes: DRIVEELY_LIMITS.maxImageBytes,
      },
    });
  } catch (error) {
    return jsonError(error);
  }
}
