import { after, NextResponse } from "next/server";
import { logApi, jsonError, ApiError } from "@/lib/margeo/api/errors";
import { checkDriveelyEnv } from "@/lib/margeo/api/env-check";
import { requireAuthUser } from "@/lib/margeo/api/auth";
import {
  assertUsableScreenshot,
  mapImageProcessingError,
  parseOptionalCoordinate,
  validateCoordinates,
  validateScreenshotFile,
} from "@/lib/margeo/api/validate-image";
import { checkRateLimitDistributed } from "@/lib/margeo/api/rate-limit-redis";
import {
  analyzeFromOnDeviceOcr,
  analyzeScreenshot,
} from "@/lib/margeo/analyze-screenshot";
import {
  evaluateAppAttestRequest,
  getAppAttestConfig,
} from "@/lib/margeo/security/app-attest";
import {
  decideAnalyzeExtraction,
  isVisionInfrastructureError,
  readFormText,
} from "@/lib/margeo/security/analyze-ocr-path";
import {
  logOcrTrustEvent,
  resolveOcrTrust,
  sha256Hex,
} from "@/lib/margeo/security/ocr-trust";
import {
  ensureProfileForUser,
  getProfileForUser,
} from "@/lib/margeo/services/profile";
import { saveAnalysis } from "@/lib/margeo/services/analyses";
import {
  assertAnalysisQuota,
  reserveDailyAnalysisSlot,
  type DailyAnalysisSlot,
} from "@/lib/margeo/services/quota";
import { uploadScreenshotBuffer } from "@/lib/margeo/services/storage";
import {
  applyCalibrationToOffer,
  getNeutralCalibration,
  getUserCalibration,
} from "@/lib/margeo/services/calibration";
import { logBetaEvent, logFirstAnalysisIfNeeded } from "@/lib/margeo/services/beta-events";
import { prepareScreenshotForVision } from "@/lib/margeo/vision/prepare-image";
import { resolveOnboardingStatus } from "@/lib/margeo/onboarding-status";
import { repairOnboardingCompletedIfNeeded } from "@/lib/margeo/onboarding-repair";

/**
 * Budget d'exécution serveur. Le client iOS attend au plus ~58 s (APIClient) :
 * le serveur doit laisser le temps au pipeline Vision de répondre dans cette fenêtre.
 */
export const maxDuration = 60;

export async function POST(request: Request) {
  const startedAt = Date.now();
  const timings: Record<string, number> = {};
  let userId: string | undefined;
  /** Emplacement de quota réservé (plan gratuit), libéré si l'analyse échoue. */
  let slot: DailyAnalysisSlot | null = null;

  const mark = (key: string, from: number) => {
    timings[key] = Date.now() - from;
  };

  try {
    const authStarted = Date.now();
    const user = await requireAuthUser();
    userId = user.id;
    mark("authMs", authStarted);

    const burst = await checkRateLimitDistributed(`analyze:${user.id}`, 60, 60_000);
    if (!burst.allowed) {
      const waitSec = Math.max(
        1,
        Math.ceil((burst.resetAt - Date.now()) / 1000),
      );
      throw new ApiError(
        `Tu as lancé trop d'analyses d'affilée. Patiente ${waitSec} seconde${waitSec > 1 ? "s" : ""} puis réessaie.`,
        429,
        "RATE_LIMITED",
      );
    }

    const env = checkDriveelyEnv();
    if (!env.vision) {
      throw new ApiError(
        "Analyse IA indisponible (clé Mistral manquante côté serveur).",
        503,
        "VISION_NOT_CONFIGURED",
      );
    }

    // Valider l'image avant le quota — évite un 429 trompeur sur fichier invalide
    const formData = await request.formData();
    const file = formData.get("image");
    if (!(file instanceof File)) {
      throw new ApiError("Image requise", 400, "IMAGE_REQUIRED");
    }
    validateScreenshotFile(file);

    const prepStarted = Date.now();
    let imageMs = 0;
    let validatedBuffer: Buffer;
    try {
      validatedBuffer = await assertUsableScreenshot(file);
      imageMs = Date.now() - prepStarted;
    } catch (error) {
      throw mapImageProcessingError(error);
    }

    // Profil + quota + compression en parallèle (buffer déjà validé)
    const prepareStarted = Date.now();
    const preparedPromise = prepareScreenshotForVision(validatedBuffer)
      .then((p) => {
        imageMs += Date.now() - prepareStarted;
        return p;
      })
      .catch((error) => {
        throw mapImageProcessingError(error);
      });

    const [profileRaw, quota, prepared] = await Promise.all([
      getProfileForUser(user.id, {
        first_name:
          typeof user.user_metadata?.first_name === "string"
            ? user.user_metadata.first_name
            : undefined,
        last_name:
          typeof user.user_metadata?.last_name === "string"
            ? user.user_metadata.last_name
            : undefined,
        avatar_url:
          typeof user.user_metadata?.avatar_url === "string"
            ? user.user_metadata.avatar_url
            : undefined,
      }).then(
        (p) =>
          p ??
          ensureProfileForUser(
            user.id,
            user.user_metadata?.name as string | undefined,
          ),
      ),
      assertAnalysisQuota(user.id),
      preparedPromise,
    ]);
    const profile = profileRaw;

    // Réservation atomique du quota gratuit : évite le dépassement des 2 analyses/jour
    // quand plusieurs requêtes arrivent simultanément.
    if (!quota.premium && quota.dailyLimit != null) {
      slot = await reserveDailyAnalysisSlot(user.id, quota.dailyLimit);
    }
    mark("prepMs", prepStarted);
    timings.imageMs = imageMs;

    if (!profile) {
      throw new ApiError("Profil introuvable", 404, "PROFILE_NOT_FOUND");
    }

    const onboardingStatus = resolveOnboardingStatus(
      {
        onboarding_completed: profile.onboardingCompleted,
        vehicle: profile.vehicle,
        target_hourly: profile.targetHourly,
        empty_returns: profile.emptyReturns,
        weekly_hours: profile.weeklyHours,
      },
      user,
    );

    if (onboardingStatus === "complete") {
      await repairOnboardingCompletedIfNeeded(
        user.id,
        {
          onboarding_completed: profile.onboardingCompleted,
          vehicle: profile.vehicle,
          target_hourly: profile.targetHourly,
          empty_returns: profile.emptyReturns,
          weekly_hours: profile.weeklyHours,
        },
        user,
      );
    } else if (onboardingStatus === "incomplete") {
      throw new ApiError(
        "Termine d'abord la configuration de ton profil (véhicule et objectifs), puis réessaie ton analyse.",
        403,
        "ONBOARDING_REQUIRED",
      );
    }

    const courierLat = parseOptionalCoordinate(formData.get("courierLat"));
    const courierLng = parseOptionalCoordinate(formData.get("courierLng"));
    const lat = courierLat ?? profile.lastLat;
    const lng = courierLng ?? profile.lastLng;
    if (lat != null && lng != null) {
      validateCoordinates(lat, lng);
    }

    const sourceField = (await readFormText(formData, "source")) ?? "vision";
    const ocrPayload = await readFormText(formData, "ocrPayload");
    const ocrChallenge = await readFormText(formData, "ocrChallenge");
    const ocrBinding = await readFormText(formData, "ocrBinding");
    const attest = await evaluateAppAttestRequest(request, {
      path: "/api/driveely/analyze",
      userId: user.id,
    });
    const ocrTrust = await resolveOcrTrust({
      sourceField,
      ocrPayload,
      hasImage: true,
      imageSha256: sha256Hex(validatedBuffer),
      ocrChallenge,
      ocrBinding,
      attest,
      attestEnabled: getAppAttestConfig().enabled,
    });
    for (const event of ocrTrust.events) {
      logOcrTrustEvent(event, {
        reason: ocrTrust.reason,
        userId: user.id,
      });
    }

    // Vision d'abord. L'OCR client n'est jamais la vérité sans preuves bound.
    const workStarted = Date.now();
    const [visionSettled, calibration] = await Promise.all([
      analyzeScreenshot(prepared, { contentHash: prepared.contentHash })
        .then((result) => ({ ok: true as const, result }))
        .catch((error: unknown) => ({ ok: false as const, error })),
      getUserCalibration(user.id).catch(() => getNeutralCalibration()),
    ]);
    mark("visionMs", workStarted);

    let vision = visionSettled.ok ? visionSettled.result : null;
    const visionUnavailable =
      !visionSettled.ok && isVisionInfrastructureError(visionSettled.error);
    if (!visionSettled.ok && !visionUnavailable) {
      throw visionSettled.error;
    }

    const visionOk =
      vision != null &&
      vision.extractionQuality !== "failed" &&
      vision.offer.payout > 0;
    const extraction = decideAnalyzeExtraction({
      trust: ocrTrust,
      visionOk,
      visionUnavailable,
    });
    timings.ocrPath = extraction.useClientOcr ? 1 : 0;

    if (extraction.useClientOcr && ocrPayload) {
      vision = await analyzeFromOnDeviceOcr(ocrPayload);
    }

    if (!vision) {
      throw new ApiError(
        "Analyse IA saturée temporairement. Réessaie dans quelques secondes.",
        503,
        "VISION_UNAVAILABLE",
      );
    }

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
      console.error("[driveely/analyze] SAVE_FAILED after Vision", {
        userId: user.id,
        source: vision.source,
        quality: vision.extractionQuality,
        missing: vision.missingFields,
        payout: calibratedOffer.payout,
        distanceKm: calibratedOffer.distanceKm ?? null,
        durationMin: calibratedOffer.durationMin ?? null,
      });
      throw new ApiError(
        "L'analyse a réussi mais n'a pas pu être enregistrée. Réessaie.",
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
          console.warn("[driveely/analyze] deferred upload:", e);
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
            ocrTrustReason: ocrTrust.reason,
            ocrExtractionReason: extraction.reason,
            ocrUsed: extraction.useClientOcr,
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
      ocrUsed: extraction.useClientOcr,
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
    // Analyse non aboutie : on rend l'emplacement de quota réservé.
    await slot?.release();
    const mapped =
      error instanceof ApiError
        ? error
        : error instanceof Error &&
            (/Analyse IA|Vision|Mistral|Groq|Gemini|IMAGE_PIPELINE/i.test(
              error.message,
            ) ||
              /rate[_ ]?limit|429/i.test(error.message))
          ? new ApiError(
              error.message.includes("429") || /rate[_ ]?limit/i.test(error.message)
                ? "Analyse IA saturée temporairement. Réessaie dans quelques secondes."
                : "Analyse IA indisponible temporairement. Réessaie dans un instant.",
              503,
              "VISION_UNAVAILABLE",
            )
          : error;

    if (
      userId &&
      !(mapped instanceof ApiError && mapped.code === "EXTRACTION_FAILED")
    ) {
      after(() => {
        void logBetaEvent({
          userId: userId!,
          eventType: "analysis_failed",
          durationMs: Date.now() - startedAt,
          errorCode: mapped instanceof ApiError ? mapped.code : "UNKNOWN",
          metadata: {
            message: mapped instanceof Error ? mapped.message : "unknown",
            visionError:
              mapped instanceof Error &&
              (mapped.message.includes("Mistral Vision") ||
                mapped.message.includes("Gemini Vision") ||
                mapped.message.includes("Groq Vision") ||
                mapped.message.includes("Vision") ||
                mapped.message.includes("Analyse IA")),
            timings,
          },
        });
      });
    }
    return jsonError(mapped);
  }
}
