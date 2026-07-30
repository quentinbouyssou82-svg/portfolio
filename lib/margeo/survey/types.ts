/**
 * Questionnaire produit Driveely — types partagés.
 * Les question_key sont stables : ajouter une question = nouveau key, jamais réutiliser.
 */

export const BETA_SURVEY_SLUG = "beta_product_v1" as const;

export type SurveyQuestionType =
  | "single_choice"
  | "text"
  | "scale"
  | "yes_no";

export type SurveyResponseStatus = "draft" | "submitted";

export type SurveyChoiceOption = {
  value: string;
  label: string;
};

/** Valeur normalisée stockée en jsonb */
export type SurveyAnswerValue =
  | { choice: string }
  | { text: string }
  | { score: number };

export type SurveyRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  version: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type SurveyQuestionRow = {
  id: string;
  survey_id: string;
  question_key: string;
  section_key: string;
  section_label: string;
  question_type: SurveyQuestionType;
  label: string;
  help_text: string | null;
  options: SurveyChoiceOption[];
  is_required: boolean;
  sort_order: number;
  step_index: number;
  is_active: boolean;
  introduced_in_version: number;
  created_at: string;
};

export type SurveyResponseRow = {
  id: string;
  survey_id: string;
  user_id: string;
  status: SurveyResponseStatus;
  app_version: string | null;
  device: string | null;
  user_agent: string | null;
  is_ios: boolean | null;
  started_at: string;
  submitted_at: string | null;
  updated_at: string;
  metadata: Record<string, unknown>;
};

export type SurveyAnswerRow = {
  id: string;
  response_id: string;
  question_id: string;
  question_key: string;
  value: SurveyAnswerValue;
  created_at: string;
  updated_at: string;
};

export type SurveyAnswerMap = Record<string, SurveyAnswerValue>;

export type SurveyDeviceInfo = {
  device: string;
  userAgent: string;
  isIOS: boolean;
  appVersion: string;
};

export type SurveyWizardStep = {
  stepIndex: number;
  sectionKey: string;
  sectionLabel: string;
  questions: SurveyQuestionRow[];
};

export type SurveyLoadPayload = {
  survey: SurveyRow;
  questions: SurveyQuestionRow[];
  steps: SurveyWizardStep[];
  response: SurveyResponseRow | null;
  answers: SurveyAnswerMap;
};

export type SurveySubmitInput = {
  surveySlug?: string;
  answers: SurveyAnswerMap;
  device: SurveyDeviceInfo;
  /** true = finalise ; false = brouillon */
  finalize: boolean;
};
