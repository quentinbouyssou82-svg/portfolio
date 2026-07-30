"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, ClipboardList, Loader2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { Button } from "@/components/margeo/ui/button";
import {
  loadSurveyAction,
  saveSurveyAction,
} from "@/lib/margeo/actions/survey";
import { margeoRoutes } from "@/lib/margeo/routes";
import {
  clearSurveyDraftLocal,
  getClientDeviceInfo,
  loadSurveyDraftLocal,
  saveSurveyDraftLocal,
  type SurveyAnswerMap,
  type SurveyAnswerValue,
  type SurveyLoadPayload,
  type SurveyQuestionRow,
} from "@/lib/margeo/survey";
import {
  SurveyChoiceButton,
  SurveyProgressBar,
  SurveyScalePicker,
  SurveyTextArea,
} from "./survey-primitives";

function answerToChoice(value: SurveyAnswerValue | undefined): string | null {
  if (!value) return null;
  if ("choice" in value) return value.choice;
  if ("score" in value) return String(value.score);
  return null;
}

function answerToText(value: SurveyAnswerValue | undefined): string {
  if (!value || !("text" in value)) return "";
  return value.text;
}

function answerToScore(value: SurveyAnswerValue | undefined): number | null {
  if (!value || !("score" in value)) return null;
  return value.score;
}

function isFilled(q: SurveyQuestionRow, answers: SurveyAnswerMap): boolean {
  const v = answers[q.question_key];
  if (!v) return false;
  if ("choice" in v) return Boolean(v.choice);
  if ("text" in v) return v.text.trim().length > 0;
  if ("score" in v) return v.score >= 1 && v.score <= 10;
  return false;
}

export function SurveyWizard() {
  const reduceMotion = useReducedMotion();
  const [payload, setPayload] = useState<SurveyLoadPayload | null>(null);
  const [answers, setAnswers] = useState<SurveyAnswerMap>({});
  const [step, setStep] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await loadSurveyAction();
      if (cancelled) return;
      if (!result.ok || !result.data) {
        setLoadError(result.ok ? "Chargement impossible." : result.message);
        setLoading(false);
        return;
      }

      const local = loadSurveyDraftLocal(result.data.survey.slug);
      const merged: SurveyAnswerMap = {
        ...(local ?? {}),
        ...result.data.answers,
      };
      setPayload(result.data);
      setAnswers(merged);
      setDone(result.data.response?.status === "submitted" && !local);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!payload || done) return;
    saveSurveyDraftLocal(answers, payload.survey.slug);
  }, [answers, payload, done]);

  const steps = payload?.steps ?? [];
  const totalSteps = steps.length || 1;
  const current = steps[step];

  const stepComplete = useMemo(() => {
    if (!current) return false;
    return current.questions
      .filter((q) => q.is_required)
      .every((q) => isFilled(q, answers));
  }, [current, answers]);

  const setAnswer = useCallback((key: string, value: SurveyAnswerValue) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setSubmitError(null);
  }, []);

  function goNext() {
    if (!stepComplete) {
      setSubmitError("Réponds à toutes les questions de cette étape.");
      return;
    }
    setSubmitError(null);
    if (step < totalSteps - 1) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    submit(true);
  }

  function goBack() {
    setSubmitError(null);
    if (step > 0) {
      setStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function submit(finalize: boolean) {
    if (!navigator.onLine) {
      saveSurveyDraftLocal(answers, payload?.survey.slug);
      setSubmitError(
        "Pas de connexion. Tes réponses sont sauvegardées sur cet appareil — réessaie plus tard.",
      );
      return;
    }

    startTransition(async () => {
      const result = await saveSurveyAction({
        answers,
        device: getClientDeviceInfo(),
        finalize,
        surveySlug: payload?.survey.slug,
      });

      if (!result.ok) {
        saveSurveyDraftLocal(answers, payload?.survey.slug);
        setSubmitError(result.message);
        return;
      }

      if (finalize) {
        clearSurveyDraftLocal(payload?.survey.slug);
        setDone(true);
      }
    });
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-mg-muted">
        <Loader2 className="size-6 animate-spin text-mg-accent" />
        <p className="text-sm">Chargement du questionnaire…</p>
      </div>
    );
  }

  if (loadError || !payload) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <ClipboardList className="mx-auto size-10 text-mg-faint" />
        <h1 className="mt-4 text-xl font-semibold text-mg-foreground">
          Questionnaire indisponible
        </h1>
        <p className="mt-2 text-sm text-mg-muted">
          {loadError ?? "Réessaie dans un instant."}
        </p>
        <Link href={margeoRoutes.retour} className="mt-6 inline-block">
          <Button variant="secondary">Retour</Button>
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-lg py-10 text-center sm:py-16"
      >
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-mg-go/30 bg-mg-go-soft">
          <CheckCircle2 className="size-7 text-mg-go" />
        </div>
        <h1 className="text-gradient mt-6 text-3xl font-bold tracking-tight text-balance">
          Merci pour ton temps
        </h1>
        <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-mg-muted text-pretty">
          Chaque réponse aide directement l&apos;équipe à prioriser ce qui compte
          vraiment pour les livreurs. Tu peux revenir modifier tes réponses à
          tout moment.
        </p>
        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:justify-center">
          <Button
            size="lg"
            className="landing-cta-primary min-h-12"
            onClick={() => {
              setDone(false);
              setStep(0);
            }}
          >
            Modifier mes réponses
          </Button>
          <Link href={margeoRoutes.retour}>
            <Button variant="secondary" size="lg" className="min-h-12 w-full">
              Retour
            </Button>
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto max-w-lg pb-8">
      <div className="mb-8 flex flex-col items-center gap-4">
        <div className="flex size-12 items-center justify-center rounded-2xl border border-mg-accent/25 bg-mg-accent-soft">
          <ClipboardList className="size-5 text-mg-accent" />
        </div>
        <div className="text-center">
          <p className="text-xs font-semibold tracking-[0.18em] text-mg-accent uppercase">
            {current?.sectionLabel ?? "Questionnaire"}
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-mg-foreground text-balance sm:text-3xl">
            {payload.survey.title}
          </h1>
          {payload.survey.description ? (
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-mg-muted">
              {payload.survey.description}
            </p>
          ) : null}
        </div>
        <SurveyProgressBar step={step} total={totalSteps} />
      </div>

      <motion.div
        key={step}
        initial={reduceMotion ? false : { opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.28, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="space-y-8"
      >
        {current?.questions.map((q) => (
          <fieldset key={q.question_key} className="space-y-3">
            <legend className="text-[0.9375rem] font-semibold leading-snug text-mg-foreground text-balance">
              {q.label}
            </legend>

            {(q.question_type === "single_choice" ||
              q.question_type === "yes_no") && (
              <div className="space-y-2">
                {q.options.map((opt) => (
                  <SurveyChoiceButton
                    key={opt.value}
                    label={opt.label}
                    selected={answerToChoice(answers[q.question_key]) === opt.value}
                    onSelect={() =>
                      setAnswer(q.question_key, { choice: opt.value })
                    }
                  />
                ))}
              </div>
            )}

            {q.question_type === "scale" && (
              <SurveyScalePicker
                value={answerToScore(answers[q.question_key])}
                onChange={(score) => setAnswer(q.question_key, { score })}
              />
            )}

            {q.question_type === "text" && (
              <SurveyTextArea
                value={answerToText(answers[q.question_key])}
                onChange={(text) => setAnswer(q.question_key, { text })}
              />
            )}
          </fieldset>
        ))}
      </motion.div>

      {submitError ? (
        <p className="mt-6 text-center text-sm text-mg-stop" role="alert">
          {submitError}
        </p>
      ) : null}

      <div className="mt-8 flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          size="lg"
          className="min-h-12"
          disabled={step === 0 || pending}
          onClick={goBack}
        >
          <ArrowLeft className="size-4" />
          Retour
        </Button>
        <Button
          type="button"
          size="lg"
          className="landing-cta-primary min-h-12 min-w-[9rem]"
          disabled={pending}
          onClick={goNext}
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : step === totalSteps - 1 ? (
            <>
              Envoyer
              <CheckCircle2 className="size-4" />
            </>
          ) : (
            <>
              Continuer
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </div>

      {payload.response?.status === "submitted" ? (
        <p className="mt-4 text-center text-xs text-mg-faint">
          Tu as déjà répondu — envoyer mettra à jour tes réponses.
        </p>
      ) : null}
    </div>
  );
}
