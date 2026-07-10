import { NextResponse } from "next/server";
import { logApi, jsonError, ApiError } from "@/lib/margeo/api/errors";
import { requireAuthUser } from "@/lib/margeo/api/auth";
import {
  parseOptionalCoordinate,
  validateCoordinates,
  validateScreenshotFile,
} from "@/lib/margeo/api/validate-image";
import { checkRateLimit } from "@/lib/margeo/api/rate-limit";
import { analyzeScreenshot } from "@/lib/margeo/analyze-screenshot";
import { distanceToPickupKm } from "@/lib/margeo/geo";
import { ensureProfileForUser } from "@/lib/margeo/services/profile";
import {
  countAnalysesForUser,
  saveAnalysis,
} from "@/lib/margeo/services/analyses";
import { assertAnalysisQuota } from "@/lib/margeo/services/quota";
import { uploadScreenshot } from "@/lib/margeo/services/storage";
import {
  applyCalibrationToOffer,
  getUserCalibration,
} from "@/lib/margeo/services/calibration";
import { logBetaEvent, logFirstAnalysisIfNeeded } from "@/lib/margeo/services/beta-events";

export async function POST(request: Request) {
  const startedAt = Date.now();
  let userId: string | undefined;

  try {
    const user = await requireAuthUser();
    userId = user.id;

    const burst = checkRateLimit(`analyze:${user.id}`, 20, 60_000);
    if (!burst.allowed) {
      throw new ApiError(
        "Trop de requêtes. Réessaie dans quelques secondes.",
        429,
        "RATE_LIMITED",
      );
    }

    const profile = await ensureProfileForUser(
      user.id,
      user.user_metadata?.name as string | undefined,
    );
    if (!profile) {
      throw new ApiError("Profil introuvable", 404, "PROFILE_NOT_FOUND");
    }

    if (!profile.onboardingCompleted) {
      throw new ApiError(
        "Termine l'onboarding avant d'analyser une course.",
        403,
        "ONBOARDING_REQUIRED",
      );
    }

    const quota = await assertAnalysisQuota(user.id);

    const formData = await request.formData();
    const file = formData.get("image");

    if (!(file instanceof File)) {
      throw new ApiError("Image requise", 400, "IMAGE_REQUIRED");
    }

    const { ext } = validateScreenshotFile(file);

    await logBetaEvent({
      userId: user.id,
      eventType: "analysis_started",
      metadata: { fileSize: file.size, mime: file.type },
    });

    const courierLat = parseOptionalCoordinate(formData.get("courierLat"));
    const courierLng = parseOptionalCoordinate(formData.get("courierLng"));
    const lat = courierLat ?? profile.lastLat;
    const lng = courierLng ?? profile.lastLng;

    if (lat != null && lng != null) {
      validateCoordinates(lat, lng);
    }

    const priorCount = await countAnalysesForUser(user.id);
    const upload = await uploadScreenshot(user.id, file, ext);
    const storageOk = upload != null;

    const visionStarted = Date.now();
    const vision = await analyzeScreenshot(file);
    const visionDurationMs = Date.now() - visionStarted;

    if (vision.extractionQuality === "failed" || vision.offer.payout <= 0) {
      await logBetaEvent({
        userId: user.id,
        eventType: "analysis_failed",
        durationMs: Date.now() - startedAt,
        visionSource: vision.source,
        visionConfidence: vision.confidence,
        errorCode: "EXTRACTION_FAILED",
        metadata: {
          missingFields: vision.missingFields,
          warnings: vision.warnings,
          geminiMs:
            vision.visionDurationMs ??
            vision.geminiDurationMs ??
            visionDurationMs,
          visionMs:
            vision.visionDurationMs ??
            vision.geminiDurationMs ??
            visionDurationMs,
          visionProvider: vision.visionProvider,
          storageOk,
        },
      });
      throw new ApiError(
        "Capture illisible — montant non détecté. Reprends une photo plus nette de la proposition de course.",
        422,
        "EXTRACTION_FAILED",
      );
    }

    const calibration = await getUserCalibration(user.id);
    const calibratedOffer = applyCalibrationToOffer(vision.offer, calibration);

    if (vision.confidence < 0.45) {
      await logBetaEvent({
        userId: user.id,
        eventType: "vision_low_confidence",
        visionSource: vision.source,
        visionConfidence: vision.confidence,
        metadata: { warnings: vision.warnings, missingFields: vision.missingFields },
      });
    }

    if (lat != null && lng != null && calibratedOffer.pickup) {
      const pickupKm = await distanceToPickupKm(
        { lat, lng },
        calibratedOffer.pickup,
        profile.city,
      );
      if (pickupKm != null) {
        calibratedOffer.pickupDistanceKm = pickupKm;
      }
    }

    const analysis = await saveAnalysis(user.id, calibratedOffer, profile, {
      imagePath: upload?.path ?? null,
      courierLat: lat,
      courierLng: lng,
      visionSource: vision.source,
      visionConfidence: vision.confidence,
      missingFields: vision.missingFields,
      extractionQuality: vision.extractionQuality,
    });

    if (!analysis) {
      throw new ApiError(
        "Impossible d'enregistrer l'analyse",
        500,
        "SAVE_FAILED",
      );
    }

    const durationMs = Date.now() - startedAt;

    await logBetaEvent({
      userId: user.id,
      eventType: "analysis_success",
      analysisId: analysis.id,
      durationMs,
      visionSource: vision.source,
      visionConfidence: vision.confidence,
      metadata: {
        platform: calibratedOffer.platform,
        verdict: analysis.verdict,
        missingFields: vision.missingFields,
        extractionQuality: vision.extractionQuality,
        geminiMs: vision.visionDurationMs ?? vision.geminiDurationMs,
        visionMs: vision.visionDurationMs ?? visionDurationMs,
        visionProvider: vision.visionProvider,
        storageOk,
        totalMs: durationMs,
        missingCount: vision.missingFields.length,
      },
    });

    await logFirstAnalysisIfNeeded(user.id, analysis.id, {
      platform: calibratedOffer.platform,
    });

    logApi("analyze.success", {
      userId: user.id,
      durationMs,
      confidence: vision.confidence,
    });

    return NextResponse.json({
      analysis,
      source: vision.source,
      confidence: vision.confidence,
      warnings: vision.warnings,
      missingFields: vision.missingFields,
      extractionQuality: vision.extractionQuality,
      isFirstAnalysis: priorCount === 0,
      analysisCount: priorCount + 1,
      quota: {
        premium: quota.premium,
        remainingToday: quota.remainingToday,
        dailyLimit: quota.dailyLimit,
      },
    });
  } catch (error) {
    if (userId && !(error instanceof ApiError && error.code === "EXTRACTION_FAILED")) {
      await logBetaEvent({
        userId,
        eventType: "analysis_failed",
        durationMs: Date.now() - startedAt,
        errorCode: error instanceof ApiError ? error.code : "UNKNOWN",
        metadata: {
          message: error instanceof Error ? error.message : "unknown",
          visionError:
            error instanceof Error &&
            (error.message.includes("Mistral Vision") ||
              error.message.includes("Gemini Vision") ||
              error.message.includes("Vision")),
        },
      });
    }
    return jsonError(error);
  }
}
