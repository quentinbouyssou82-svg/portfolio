import { NextResponse } from "next/server";
import { jsonError, ApiError } from "@/lib/margeo/api/errors";
import { requireAuthUser } from "@/lib/margeo/api/auth";
import { checkRateLimit } from "@/lib/margeo/api/rate-limit";
import { UBERLY_LIMITS } from "@/lib/margeo/constants/limits";
import { saveFeedback } from "@/lib/margeo/services/feedback";
import { getAnalysisById } from "@/lib/margeo/services/analyses";
import { logBetaEvent } from "@/lib/margeo/services/beta-events";

export async function POST(request: Request) {
  try {
    const user = await requireAuthUser();

    const limit = checkRateLimit(
      `feedback:${user.id}`,
      UBERLY_LIMITS.feedbackRequestsPerMinute,
      60_000,
    );
    if (!limit.allowed) {
      throw new ApiError("Trop de requêtes", 429, "RATE_LIMITED");
    }

    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      throw new ApiError("Corps JSON invalide", 400, "INVALID_JSON");
    }

    const analysisId = String(body.analysisId ?? "").trim();
    if (!analysisId) {
      throw new ApiError("analysisId requis", 400, "MISSING_ANALYSIS_ID");
    }

    const analysis = await getAnalysisById(user.id, analysisId);
    if (!analysis) {
      throw new ApiError("Analyse introuvable", 404, "ANALYSIS_NOT_FOUND");
    }

    const accepted = Boolean(body.accepted);

    const actualDurationMin =
      body.actualDurationMin != null
        ? Number(body.actualDurationMin)
        : undefined;
    const actualGain =
      body.actualGain != null ? Number(body.actualGain) : undefined;
    const actualDistanceKm =
      body.actualDistanceKm != null
        ? Number(body.actualDistanceKm)
        : undefined;

    if (
      actualDurationMin != null &&
      (!Number.isFinite(actualDurationMin) || actualDurationMin < 1)
    ) {
      throw new ApiError("Durée réelle invalide", 400, "INVALID_DURATION");
    }
    if (
      actualGain != null &&
      (!Number.isFinite(actualGain) || actualGain < 0)
    ) {
      throw new ApiError("Gain réel invalide", 400, "INVALID_GAIN");
    }
    if (
      actualDistanceKm != null &&
      (!Number.isFinite(actualDistanceKm) || actualDistanceKm < 0)
    ) {
      throw new ApiError("Distance réelle invalide", 400, "INVALID_DISTANCE");
    }

    const feedback = await saveFeedback(user.id, {
      analysisId,
      accepted,
      actualDurationMin,
      actualGain,
      actualDistanceKm,
    });

    if (!feedback) {
      throw new ApiError(
        "Impossible d'enregistrer le feedback",
        500,
        "SAVE_FAILED",
      );
    }

    await logBetaEvent({
      userId: user.id,
      eventType: "feedback_submitted",
      analysisId,
      metadata: {
        accepted,
        hasActualDuration: actualDurationMin != null,
        hasActualGain: actualGain != null,
      },
    });

    const durationDelta =
      actualDurationMin != null && analysis.offer.durationMin != null
        ? actualDurationMin - analysis.offer.durationMin
        : null;
    const gainDelta =
      actualGain != null ? actualGain - analysis.grossGain : null;
    const hasCorrection =
      (durationDelta != null && Math.abs(durationDelta) >= 3) ||
      (gainDelta != null && Math.abs(gainDelta) >= 0.5);

    if (hasCorrection) {
      await logBetaEvent({
        userId: user.id,
        eventType: "feedback_correction",
        analysisId,
        metadata: {
          durationDelta,
          gainDelta,
          estimatedDuration: analysis.offer.durationMin,
          estimatedGain: analysis.grossGain,
        },
      });
    }

    return NextResponse.json({ feedback });
  } catch (error) {
    return jsonError(error);
  }
}
