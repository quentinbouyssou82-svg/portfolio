import { createMargeoServerClient } from "@/lib/margeo/supabase/server";
import { BETA_SURVEY_QUESTIONS } from "@/lib/margeo/survey/questions";
import type {
  SurveyAnswerMap,
  SurveyAnswerValue,
  SurveyChoiceOption,
  SurveyDeviceInfo,
  SurveyLoadPayload,
  SurveyQuestionRow,
  SurveyQuestionType,
  SurveyResponseRow,
  SurveyRow,
  SurveyWizardStep,
} from "@/lib/margeo/survey/types";
import { BETA_SURVEY_SLUG } from "@/lib/margeo/survey/types";

function asOptions(raw: unknown): SurveyChoiceOption[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const value = (item as { value?: unknown }).value;
      const label = (item as { label?: unknown }).label;
      if (typeof value !== "string" || typeof label !== "string") return null;
      return { value, label };
    })
    .filter((x): x is SurveyChoiceOption => Boolean(x));
}

function normalizeAnswerValue(raw: unknown): SurveyAnswerValue | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  if (typeof obj.choice === "string") return { choice: obj.choice };
  if (typeof obj.text === "string") return { text: obj.text };
  if (typeof obj.score === "number" && Number.isFinite(obj.score)) {
    return { score: obj.score };
  }
  if (typeof obj.score === "string" && obj.score.trim()) {
    const n = Number(obj.score);
    if (Number.isFinite(n)) return { score: n };
  }
  return null;
}

function buildSteps(questions: SurveyQuestionRow[]): SurveyWizardStep[] {
  const byStep = new Map<number, SurveyQuestionRow[]>();
  for (const q of questions) {
    const list = byStep.get(q.step_index) ?? [];
    list.push(q);
    byStep.set(q.step_index, list);
  }
  return [...byStep.entries()]
    .sort(([a], [b]) => a - b)
    .map(([stepIndex, qs]) => {
      const sorted = [...qs].sort((a, b) => a.sort_order - b.sort_order);
      return {
        stepIndex,
        sectionKey: sorted[0]?.section_key ?? `step_${stepIndex}`,
        sectionLabel: sorted[0]?.section_label ?? `Étape ${stepIndex + 1}`,
        questions: sorted,
      };
    });
}

/** Fallback local si la table n'est pas encore migrée. */
function fallbackQuestions(surveyId: string): SurveyQuestionRow[] {
  const now = new Date().toISOString();
  return BETA_SURVEY_QUESTIONS.map((def) => ({
    id: `local-${def.questionKey}`,
    survey_id: surveyId,
    question_key: def.questionKey,
    section_key: def.sectionKey,
    section_label: def.sectionLabel,
    question_type: def.questionType,
    label: def.label,
    help_text: null,
    options: def.options ?? [],
    is_required: def.required !== false,
    sort_order: def.sortOrder,
    step_index: def.stepIndex,
    is_active: true,
    introduced_in_version: 1,
    created_at: now,
  }));
}

export async function loadSurveyForUser(
  userId: string,
  surveySlug: string = BETA_SURVEY_SLUG,
): Promise<SurveyLoadPayload | null> {
  const supabase = await createMargeoServerClient();

  const { data: surveyData, error: surveyError } = await supabase
    .from("margeo_surveys")
    .select("*")
    .eq("slug", surveySlug)
    .eq("is_active", true)
    .maybeSingle();

  let survey: SurveyRow;
  let questions: SurveyQuestionRow[];

  if (surveyError || !surveyData) {
    // Migration pas encore appliquée — UI utilisable avec catalogue local
    const now = new Date().toISOString();
    survey = {
      id: "local-beta-survey",
      slug: surveySlug,
      title: "Questionnaire produit Driveely",
      description:
        "Aide-nous à construire l'outil indispensable des livreurs pendant la bêta.",
      version: 1,
      is_active: true,
      created_at: now,
      updated_at: now,
    };
    questions = fallbackQuestions(survey.id);
    return {
      survey,
      questions,
      steps: buildSteps(questions),
      response: null,
      answers: {},
    };
  }

  survey = surveyData as SurveyRow;

  const { data: questionRows, error: qError } = await supabase
    .from("margeo_survey_questions")
    .select("*")
    .eq("survey_id", survey.id)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (qError || !questionRows?.length) {
    questions = fallbackQuestions(survey.id);
  } else {
    questions = (questionRows as Array<Record<string, unknown>>).map((row) => ({
      id: String(row.id),
      survey_id: String(row.survey_id),
      question_key: String(row.question_key),
      section_key: String(row.section_key),
      section_label: String(row.section_label),
      question_type: row.question_type as SurveyQuestionType,
      label: String(row.label),
      help_text: (row.help_text as string | null) ?? null,
      options: asOptions(row.options),
      is_required: Boolean(row.is_required),
      sort_order: Number(row.sort_order),
      step_index: Number(row.step_index),
      is_active: Boolean(row.is_active),
      introduced_in_version: Number(row.introduced_in_version ?? 1),
      created_at: String(row.created_at),
    }));
  }

  const { data: responseData } = await supabase
    .from("margeo_survey_responses")
    .select("*")
    .eq("survey_id", survey.id)
    .eq("user_id", userId)
    .maybeSingle();

  const response = (responseData as SurveyResponseRow | null) ?? null;
  const answers: SurveyAnswerMap = {};

  if (response) {
    const { data: answerRows } = await supabase
      .from("margeo_survey_answers")
      .select("*")
      .eq("response_id", response.id);

    for (const row of answerRows ?? []) {
      const value = normalizeAnswerValue(
        (row as { value?: unknown }).value,
      );
      const key = String((row as { question_key?: unknown }).question_key);
      if (value && key) answers[key] = value;
    }
  }

  return {
    survey,
    questions,
    steps: buildSteps(questions),
    response,
    answers,
  };
}

function isAnswerFilled(
  question: SurveyQuestionRow,
  value: SurveyAnswerValue | undefined,
): boolean {
  if (!value) return false;
  if ("choice" in value) return Boolean(value.choice);
  if ("text" in value) return value.text.trim().length > 0;
  if ("score" in value) {
    return Number.isFinite(value.score) && value.score >= 1 && value.score <= 10;
  }
  return false;
}

export function validateSurveyAnswers(
  questions: SurveyQuestionRow[],
  answers: SurveyAnswerMap,
): { ok: true } | { ok: false; message: string; missingKeys: string[] } {
  const missing: string[] = [];
  for (const q of questions) {
    if (!q.is_required) continue;
    if (!isAnswerFilled(q, answers[q.question_key])) {
      missing.push(q.question_key);
    }
  }
  if (missing.length) {
    return {
      ok: false,
      message: "Merci de répondre à toutes les questions obligatoires.",
      missingKeys: missing,
    };
  }
  return { ok: true };
}

export async function saveSurveyAnswers(input: {
  userId: string;
  surveySlug?: string;
  answers: SurveyAnswerMap;
  device: SurveyDeviceInfo;
  finalize: boolean;
}): Promise<
  | { ok: true; responseId: string; status: "draft" | "submitted" }
  | { ok: false; message: string; code?: "UNAUTHORIZED" | "VALIDATION" | "ERROR" | "OFFLINE_SCHEMA" }
> {
  const slug = input.surveySlug ?? BETA_SURVEY_SLUG;
  const loaded = await loadSurveyForUser(input.userId, slug);
  if (!loaded) {
    return { ok: false, message: "Questionnaire introuvable.", code: "ERROR" };
  }

  if (loaded.survey.id.startsWith("local-")) {
    return {
      ok: false,
      message:
        "Le questionnaire n'est pas encore activé en base. Exécute la migration driveely-survey-v1.sql.",
      code: "OFFLINE_SCHEMA",
    };
  }

  if (input.finalize) {
    const validation = validateSurveyAnswers(loaded.questions, input.answers);
    if (!validation.ok) {
      return {
        ok: false,
        message: validation.message,
        code: "VALIDATION",
      };
    }
  }

  const supabase = await createMargeoServerClient();
  const now = new Date().toISOString();

  const responsePayload = {
    survey_id: loaded.survey.id,
    user_id: input.userId,
    status: input.finalize ? ("submitted" as const) : ("draft" as const),
    app_version: input.device.appVersion,
    device: input.device.device,
    user_agent: input.device.userAgent,
    is_ios: input.device.isIOS,
    updated_at: now,
    ...(input.finalize ? { submitted_at: now } : {}),
  };

  let responseId = loaded.response?.id;

  if (!responseId) {
    const { data, error } = await supabase
      .from("margeo_survey_responses")
      .insert(responsePayload)
      .select("id")
      .single();
    if (error || !data) {
      console.warn("[survey] insert response", error);
      return {
        ok: false,
        message: "Impossible d'enregistrer. Vérifie ta connexion.",
        code: "ERROR",
      };
    }
    responseId = data.id as string;
  } else {
    const { error } = await supabase
      .from("margeo_survey_responses")
      .update(responsePayload)
      .eq("id", responseId)
      .eq("user_id", input.userId);
    if (error) {
      console.warn("[survey] update response", error);
      return {
        ok: false,
        message: "Impossible d'enregistrer. Vérifie ta connexion.",
        code: "ERROR",
      };
    }
  }

  const questionByKey = new Map(
    loaded.questions.map((q) => [q.question_key, q]),
  );

  for (const [key, value] of Object.entries(input.answers)) {
    const question = questionByKey.get(key);
    if (!question || question.id.startsWith("local-")) continue;

    const { data: existing } = await supabase
      .from("margeo_survey_answers")
      .select("id, value, updated_at, created_at")
      .eq("response_id", responseId)
      .eq("question_id", question.id)
      .maybeSingle();

    if (existing) {
      const prev = normalizeAnswerValue(existing.value);
      const changed =
        JSON.stringify(prev) !== JSON.stringify(value);
      if (changed && prev) {
        await supabase.from("margeo_survey_answer_history").insert({
          response_id: responseId,
          user_id: input.userId,
          question_id: question.id,
          question_key: key,
          value: prev,
          answered_at: existing.updated_at ?? existing.created_at ?? now,
          superseded_at: now,
        });
      }

      const { error } = await supabase
        .from("margeo_survey_answers")
        .update({ value, question_key: key, updated_at: now })
        .eq("id", existing.id);
      if (error) {
        console.warn("[survey] update answer", key, error);
        return {
          ok: false,
          message: "Enregistrement partiel. Réessaie.",
          code: "ERROR",
        };
      }
    } else {
      const { error } = await supabase.from("margeo_survey_answers").insert({
        response_id: responseId,
        question_id: question.id,
        question_key: key,
        value,
      });
      if (error) {
        console.warn("[survey] insert answer", key, error);
        return {
          ok: false,
          message: "Enregistrement partiel. Réessaie.",
          code: "ERROR",
        };
      }
    }
  }

  return {
    ok: true,
    responseId,
    status: input.finalize ? "submitted" : "draft",
  };
}
