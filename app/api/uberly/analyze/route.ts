import { after, NextResponse } from "next/server";
import { logApi, jsonError, ApiError } from "@/lib/margeo/api/errors";
import { checkUberlyEnv } from "@/lib/margeo/api/env-check";
import { requireAuthUser } from "@/lib/margeo/api/auth";
import {
  parseOptionalCoordinate,
  validateCoordinates,
  validateScreenshotFile,
} from "@/lib/margeo/api/validate-image";
import { checkRateLimit } from "@/lib/margeo/api/rate-limit";
import { analyzeScreenshot } from "@/lib/margeo/analyze-screenshot";
import { ensureProfileForUser } from "@/lib/margeo/services/profile";
import { saveAnalysis } from "@/lib/margeo/services/analyses";
import { assertAnalysisQuota } from "@/lib/margeo/services/quota";
import { uploadScreenshotBuffer } from "@/lib/margeo/services/storage";
import {
  applyCalibrationToOffer,
  getNeutralCalibration,
  getUserCalibration,
} from "@/lib/margeo/services/calibration";
import { logBetaEvent, logFirstAnalysisIfNeeded } from "@/lib/margeo/services/beta-events";
import { prepareScreenshotForVision } from "@/lib/margeo/vision/prepare-image";

export async function POST(request: Request) {
  const startedAt = Date.now();
  const timings: Record<string, number> = {};
  let userId: string | undefined;

  const mark = (key: string, from: number) => {
    timings[key] = Date.now() - from;
  };

  try {
    const authStarted = Date.now();
    const user = await requireAuthUser();
    userId = user.id;
    mark("authMs", authStarted);

    const burst = checkRateLimit(`analyze:${user.id}`, 60, 60_000);
    if (!burst.allowed) {
      throw new ApiError(
        "Trop de requêtes. Réessaie dans quelques secondes.",
        429,
        "RATE_LIMITED",
      );
    }

    const env = checkUberlyEnv();
    if (!env.vision) {
      throw new ApiError(
        "Analyse IA indisponible (clé Mistral manquante côté serveur).",
        503,
        "VISION_NOT_CONFIGURED",
      );
    }

    // Auth parallèle : profil + quota + formData
    const prepStarted = Date.now();
    const [profile, quota, formData] = await Promise.all([
      ensureProfileForUser(
        user.id,
        user.user_metadata?.name as string | undefined,
      ),
      assertAnalysisQuota(user.id),
      request.formData(),
    ]);
    mark("prepMs", prepStarted);

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

    const file = formData.get("image");
    if (!(file instanceof File)) {
      throw new ApiError("Image requise", 400, "IMAGE_REQUIRED");
    }

    validateScreenshotFile(file);

    const courierLat = parseOptionalCoordinate(formData.get("courierLat"));
    const courierLng = parseOptionalCoordinate(formData.get("courierLng"));
    const lat = courierLat ?? profile.lastLat;
    const lng = courierLng ?? profile.lastLng;
    if (lat != null && lng != null) {
      validateCoordinates(lat, lng);
    }

    // Compression
    const imageStarted = Date.now();
    const prepared = await prepareScreenshotForVision(file);
    mark("imageMs", imageStarted);

    // Chemin critique : Vision (+ calibration légère en parallèle)
    // Upload Storage + count analyses → after() (hors latence utilisateur)
    const workStarted = Date.now();
    const [vision, calibration] = await Promise.all([
      analyzeScreenshot(prepared, { contentHash: prepared.contentHash }),
      getUserCalibration(user.id).catch(() => getNeutralCalibration()),
    ]);
    mark("visionMs", workStarted);
    timings.visionOnlyMs = vision.fromCache
      ? 0
      : (vision.visionDurationMs ?? timings.visionMs);
    timings.cacheHit = vision.fromCache ? 1 : 0;

    if (vision.extractionQuality === "failed" || vision.offer.payout <= 0) {
      after(() => {
        void logBetaEvent({
          userId: user.id,
          eventType: "analysis_failed",
          durationMs: Date.now() - startedAt,
          visionSource: vision.source,
          visionConfidence: vision.confidence,
          errorCode: "EXTRACTION_FAILED",
          metadata: {
            missingFields: vision.missingFields,
            warnings: vision.warnings,
            visionMs: timings.visionOnlyMs,
            visionProvider: vision.visionProvider,
            imageBytes: prepared.preparedBytes,
          },
        });
      });
      throw new ApiError(
        "Capture illisible — montant non détecté. Reprends une photo plus nette de la proposition de course.",
        422,
        "EXTRACTION_FAILED",
      );
    }

    const calibratedOffer = applyCalibrationToOffer(vision.offer, calibration);

    const saveStarted = Date.now();
    // image_path null pour l'instant — patché en after() après upload
    const analysis = await saveAnalysis(user.id, calibratedOffer, profile, {
      imagePath: null,
      courierLat: lat,
      courierLng: lng,
      visionSource: vision.source,
      visionConfidence: vision.confidence,
      missingFields: vision.missingFields,
      extractionQuality: vision.extractionQuality,
    });
    mark("saveMs", saveStarted);

    if (!analysis) {
      throw new ApiError(
        "Impossible d'enregistrer l'analyse",
        500,
        "SAVE_FAILED",
      );
    }

    const durationMs = Date.now() - startedAt;
    timings.totalMs = durationMs;
    timings.parseMs = 0;

    after(() => {
      void (async () => {
        // Upload Storage hors chemin critique
        let storageOk = false;
        try {
          const upload = await uploadScreenshotBuffer(
            user.id,
            prepared.buffer,
            prepared.ext,
            prepared.mimeType,
          );
          storageOk = upload != null;
          if (upload?.path) {
            const { createMargeoServerClient } = await import(
              "@/lib/margeo/supabase/server"
            );
            const supabase = await createMargeoServerClient();
            await supabase
              .from("margeo_rides")
              .update({ image_path: upload.path })
              .eq("id", analysis.offer.id);
          }
        } catch (e) {
          console.warn("[uberly/analyze] deferred upload:", e);
        }

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
            visionMs: timings.visionOnlyMs,
            visionProvider: vision.visionProvider,
            fromCache: Boolean(vision.fromCache),
            storageOk,
            totalMs: durationMs,
            timings,
            imageOriginalBytes: prepared.originalBytes,
            imagePreparedBytes: prepared.preparedBytes,
          },
        });
        await logFirstAnalysisIfNeeded(user.id, analysis.id, {
          platform: calibratedOffer.platform,
        });
        if (vision.confidence < 0.45) {
          await logBetaEvent({
            userId: user.id,
            eventType: "vision_low_confidence",
            analysisId: analysis.id,
            visionSource: vision.source,
            visionConfidence: vision.confidence,
            metadata: {
              warnings: vision.warnings,
              missingFields: vision.missingFields,
            },
          });
        }
      })();
    });

    logApi("analyze.success", {
      userId: user.id,
      durationMs,
      confidence: vision.confidence,
      timings,
    });

    return NextResponse.json({
      analysis,
      source: vision.source,
      confidence: vision.confidence,
      warnings: vision.warnings,
      missingFields: vision.missingFields,
      extractionQuality: vision.extractionQuality,
      fromCache: Boolean(vision.fromCache),
      quota: {
        premium: quota.premium,
        remainingToday: quota.remainingToday,
        dailyLimit: quota.dailyLimit,
      },
      timings: {
        auth: timings.authMs,
        prep: timings.prepMs,
        compression: timings.imageMs,
        ia: timings.visionOnlyMs,
        save: timings.saveMs,
        total: durationMs,
        // aliases legacy bench
        upload: timings.imageMs,
        parsing: 0,
      },
    });
  } catch (error) {
    if (
      userId &&
      !(error instanceof ApiError && error.code === "EXTRACTION_FAILED")
    ) {
      after(() => {
        void logBetaEvent({
          userId: userId!,
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
            timings,
          },
        });
      });
    }
    return jsonError(error);
  }
}
