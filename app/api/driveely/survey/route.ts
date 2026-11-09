import { NextResponse } from "next/server";
import { jsonError, ApiError } from "@/lib/margeo/api/errors";
import { requireAuthUser } from "@/lib/margeo/api/auth";
import { checkRateLimitDistributed } from "@/lib/margeo/api/rate-limit-redis";
import { createMargeoRequestDb } from "@/lib/margeo/supabase/request-db";
import {
  loadSurveyForUser,
  saveSurveyAnswers,
} from "@/lib/margeo/services/survey";
import type { SurveyAnswerMap, SurveyDeviceInfo } from "@/lib/margeo/survey/types";
import { BETA_SURVEY_SLUG } from "@/lib/margeo/survey/types";
import { logBetaEvent } from "@/lib/margeo/services/beta-events";

function normalizeAnswers(raw: unknown): SurveyAnswerMap {
  if (!raw || typeof raw !== "object") return {};
  const out: SurveyAnswerMap = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!value || typeof value !== "object") continue;
    const obj = value as Record<string, unknown>;
    if (typeof obj.choice === "string") out[key] = { choice: obj.choice };
    else if (typeof obj.text === "string") out[key] = { text: obj.text };
    else if (typeof obj.score === "number" && Number.isFinite(obj.score)) {
      out[key] = { score: obj.score };
    }
  }
  return out;
}

function normalizeDevice(raw: unknown): SurveyDeviceInfo {
  const obj = (raw && typeof raw === "object" ? raw : {}) as Record<
    string,
    unknown
  >;
  return {
    device: typeof obj.device === "string" ? obj.device : "unknown",
    userAgent: typeof obj.userAgent === "string" ? obj.userAgent : "",
    isIOS: Boolean(obj.isIOS),
    appVersion: typeof obj.appVersion === "string" ? obj.appVersion : "",
  };
}

export async function GET() {
  try {
    const user = await requireAuthUser();
    const db = await createMargeoRequestDb();
    const loaded = await loadSurveyForUser(user.id, BETA_SURVEY_SLUG, db);
    if (!loaded) {
      throw new ApiError("Questionnaire introuvable", 404, "NOT_FOUND");
    }

    return NextResponse.json({
      survey: loaded.survey,
      questions: loaded.questions,
      answers: loaded.answers,
      alreadySubmitted: loaded.response?.status === "submitted",
      responseId: loaded.response?.id ?? null,
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuthUser();

    const limit = await checkRateLimitDistributed(`survey:${user.id}`, 6, 60_000);
    if (!limit.allowed) {
      throw new ApiError("Trop de requêtes", 429, "RATE_LIMITED");
    }

    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      throw new ApiError("Corps JSON invalide", 400, "INVALID_JSON");
    }

    const answers = normalizeAnswers(body.answers);
    const finalize = Boolean(body.finalize);
    const device = normalizeDevice(body.device);
    const db = await createMargeoRequestDb();

    const result = await saveSurveyAnswers({
      userId: user.id,
      surveySlug: BETA_SURVEY_SLUG,
      answers,
      device,
      finalize,
      supabaseClient: db,
    });

    if (!result.ok) {
      throw new ApiError(
        result.message,
        result.code === "VALIDATION"
          ? 400
          : result.code === "OFFLINE_SCHEMA"
            ? 503
            : 500,
        result.code,
      );
    }

    if (finalize) {
      await logBetaEvent({
        userId: user.id,
        eventType: "feedback_submitted",
        metadata: {
          channel: "product_survey",
          surveySlug: BETA_SURVEY_SLUG,
          responseId: result.responseId,
        },
      });
    }

    return NextResponse.json({
      ok: true,
      responseId: result.responseId,
      status: result.status,
    });
  } catch (error) {
    return jsonError(error);
  }
}
