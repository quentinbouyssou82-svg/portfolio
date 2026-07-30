import type { SurveyAnswerMap } from "./types";
import { BETA_SURVEY_SLUG } from "./types";

const DRAFT_PREFIX = "driveely_survey_draft:";

export function surveyDraftStorageKey(slug: string = BETA_SURVEY_SLUG): string {
  return `${DRAFT_PREFIX}${slug}`;
}

export function saveSurveyDraftLocal(
  answers: SurveyAnswerMap,
  slug: string = BETA_SURVEY_SLUG,
): void {
  try {
    localStorage.setItem(
      surveyDraftStorageKey(slug),
      JSON.stringify({ answers, savedAt: Date.now() }),
    );
  } catch {
    // quota / private mode
  }
}

export function loadSurveyDraftLocal(
  slug: string = BETA_SURVEY_SLUG,
): SurveyAnswerMap | null {
  try {
    const raw = localStorage.getItem(surveyDraftStorageKey(slug));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { answers?: SurveyAnswerMap };
    if (!parsed?.answers || typeof parsed.answers !== "object") return null;
    return parsed.answers;
  } catch {
    return null;
  }
}

export function clearSurveyDraftLocal(slug: string = BETA_SURVEY_SLUG): void {
  try {
    localStorage.removeItem(surveyDraftStorageKey(slug));
  } catch {
    // ignore
  }
}
