"use server";

import { getAuthUser } from "@/lib/margeo/auth/session";
import { logBetaEvent } from "@/lib/margeo/services/beta-events";
import {
  loadSurveyForUser,
  saveSurveyAnswers,
} from "@/lib/margeo/services/survey";
import type {
  SurveyAnswerMap,
  SurveyDeviceInfo,
  SurveyLoadPayload,
} from "@/lib/margeo/survey/types";
import { BETA_SURVEY_SLUG } from "@/lib/margeo/survey/types";

export type SurveyActionResult<T = void> =
  | { ok: true; data?: T }
  | {
      ok: false;
      message: string;
      code?: "UNAUTHORIZED" | "VALIDATION" | "ERROR" | "OFFLINE_SCHEMA";
    };

export async function loadSurveyAction(
  surveySlug: string = BETA_SURVEY_SLUG,
): Promise<SurveyActionResult<SurveyLoadPayload>> {
  const user = await getAuthUser();
  if (!user) {
    return { ok: false, message: "Connecte-toi pour répondre.", code: "UNAUTHORIZED" };
  }

  try {
    const payload = await loadSurveyForUser(user.id, surveySlug);
    if (!payload) {
      return { ok: false, message: "Questionnaire introuvable.", code: "ERROR" };
    }
    return { ok: true, data: payload };
  } catch (e) {
    console.warn("[survey] load failed", e);
    return {
      ok: false,
      message: "Impossible de charger le questionnaire. Vérifie ta connexion.",
      code: "ERROR",
    };
  }
}

export async function saveSurveyAction(input: {
  answers: SurveyAnswerMap;
  device: SurveyDeviceInfo;
  finalize: boolean;
  surveySlug?: string;
}): Promise<
  SurveyActionResult<{ responseId: string; status: "draft" | "submitted" }>
> {
  const user = await getAuthUser();
  if (!user) {
    return { ok: false, message: "Connecte-toi pour envoyer.", code: "UNAUTHORIZED" };
  }

  try {
    const result = await saveSurveyAnswers({
      userId: user.id,
      surveySlug: input.surveySlug,
      answers: input.answers,
      device: input.device,
      finalize: input.finalize,
    });

    if (!result.ok) {
      return {
        ok: false,
        message: result.message,
        code: result.code,
      };
    }

    if (input.finalize) {
      await logBetaEvent({
        userId: user.id,
        eventType: "feedback_submitted",
        metadata: {
          channel: "survey",
          surveySlug: input.surveySlug ?? BETA_SURVEY_SLUG,
          responseId: result.responseId,
        },
      });
    }

    return {
      ok: true,
      data: { responseId: result.responseId, status: result.status },
    };
  } catch (e) {
    console.warn("[survey] save failed", e);
    return {
      ok: false,
      message: "Envoi impossible. Tes réponses sont conservées sur cet appareil.",
      code: "ERROR",
    };
  }
}
