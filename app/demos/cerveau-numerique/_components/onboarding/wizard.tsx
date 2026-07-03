"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { PartyPopper } from "lucide-react";

import {
  DOMAIN_OPTIONS,
  MAIL_ORG_OPTIONS,
  computeSteps,
  proposedFolders,
  type StepDef,
} from "../../_lib/onboarding-config";
import { Button, ButtonLink } from "../ui/button";
import { WizardHeader } from "./wizard-header";
import { WizardProgress } from "./wizard-progress";
import { StepCard } from "./step-card";
import { WizardFooter } from "./wizard-footer";
import { TextStep } from "./steps/text-step";
import { MultiSelectStep } from "./steps/multi-select-step";
import { CardSelectStep } from "./steps/card-select-step";
import { WorkStep, type WorkValue } from "./steps/work-step";
import { FolderChecklist } from "./steps/folder-checklist";

const CN = "/demos/cerveau-numerique";

type Answers = {
  name: string;
  domains: string[];
  mailOrg: string | null;
  work: WorkValue;
};

type Phase = "steps" | "recap" | "done";

const variants = {
  enter: { opacity: 0, y: 16 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
};

export function Wizard() {
  const [answers, setAnswers] = useState<Answers>({
    name: "",
    domains: [],
    mailOrg: null,
    work: { option: null, tags: [] },
  });
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("steps");

  const steps = useMemo(() => computeSteps(answers.domains), [answers.domains]);
  const step: StepDef | undefined = steps[index];
  const folders = useMemo(() => proposedFolders(answers.domains), [answers.domains]);
  const [checkedFolders, setCheckedFolders] = useState<string[]>([]);

  const isStepValid = (s: StepDef): boolean => {
    switch (s.id) {
      case "identity":
        return answers.name.trim().length > 0;
      case "domains":
        return answers.domains.length > 0;
      case "mailOrg":
        return answers.mailOrg !== null;
      case "work":
        return answers.work.option !== null || answers.work.tags.length > 0;
    }
  };

  const goNext = () => {
    if (index < steps.length - 1) {
      setIndex((i) => i + 1);
    } else {
      setCheckedFolders(folders);
      setPhase("recap");
    }
  };

  const goBack = () => setIndex((i) => Math.max(0, i - 1));

  const toggleDomain = (id: string) =>
    setAnswers((a) => ({
      ...a,
      domains: a.domains.includes(id)
        ? a.domains.filter((d) => d !== id)
        : [...a.domains, id],
    }));

  const toggleFolder = (folder: string) =>
    setCheckedFolders((c) =>
      c.includes(folder) ? c.filter((f) => f !== folder) : [...c, folder],
    );

  /* ---------- Recap phase ---------- */
  if (phase === "recap") {
    return (
      <div className="relative z-10 flex min-h-screen flex-col">
        <WizardHeader tagline="Ton rangement, déjà prêt" />
        <main className="flex flex-1 items-center justify-center px-6 py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-xl"
          >
            <div className="cn-card p-6 sm:p-7">
              <h2 className="text-xl font-bold tracking-tight">
                📁 Voici les dossiers que je te propose
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--cn-muted)]">
                Basés sur les domaines que tu as choisis. Décoche ceux que tu ne
                veux pas — tu gardes le contrôle. Les sous-dossiers se créeront
                tout seuls au fur et à mesure que tes documents arrivent.
              </p>
              <div className="mt-6">
                <FolderChecklist
                  folders={folders}
                  checked={checkedFolders}
                  onToggle={toggleFolder}
                />
              </div>
            </div>
          </motion.div>
        </main>
        <div className="mx-auto flex w-full max-w-xl items-center justify-between gap-4 px-6 pb-10 text-sm">
          <button
            type="button"
            onClick={() => setPhase("done")}
            className="text-[var(--cn-faint)] transition-colors hover:text-[var(--cn-muted)]"
          >
            Passer cette étape
          </button>
          <span className="text-xs tabular-nums text-[var(--cn-faint)]">
            {checkedFolders.length}/{folders.length} dossier
            {folders.length > 1 ? "s" : ""}
          </span>
          <Button onClick={() => setPhase("done")}>Créer mes dossiers</Button>
        </div>
      </div>
    );
  }

  /* ---------- Done phase ---------- */
  if (phase === "done") {
    return (
      <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="cn-card w-full max-w-md p-8 text-center"
        >
          <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-[var(--cn-primary-tint)] text-[var(--cn-primary)]">
            <PartyPopper className="size-7" />
          </span>
          <h2 className="mt-5 text-2xl font-bold tracking-tight">
            {answers.name ? `C'est prêt, ${answers.name} !` : "C'est prêt !"}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--cn-muted)]">
            Ton cerveau numérique est configuré. Il va maintenant travailler pour
            toi en arrière-plan.
          </p>
          <div className="mt-7 flex flex-col gap-3">
            <ButtonLink href={`${CN}/dashboard`} className="w-full">
              Accéder à mon espace
            </ButtonLink>
            <ButtonLink href={CN} variant="ghost" className="w-full">
              Retour à l'accueil
            </ButtonLink>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ---------- Steps phase ---------- */
  if (!step) return null;

  return (
    <div className="relative z-10 flex min-h-screen flex-col">
      <WizardHeader tagline="Faisons connaissance !" />
      <WizardProgress
        current={index + 1}
        total={steps.length}
        section={step.section}
      />

      <main className="flex flex-1 items-start justify-center px-6 pt-8">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              <StepCard
                badge={step.badge}
                badgeEmoji={step.badgeEmoji}
                title={step.title}
                description={step.description}
              >
                {step.id === "identity" && (
                  <TextStep
                    value={answers.name}
                    onChange={(name) => setAnswers((a) => ({ ...a, name }))}
                  />
                )}
                {step.id === "domains" && (
                  <MultiSelectStep
                    options={DOMAIN_OPTIONS}
                    selected={answers.domains}
                    onToggle={toggleDomain}
                  />
                )}
                {step.id === "mailOrg" && (
                  <CardSelectStep
                    options={MAIL_ORG_OPTIONS}
                    selected={answers.mailOrg}
                    onSelect={(mailOrg) =>
                      setAnswers((a) => ({ ...a, mailOrg }))
                    }
                  />
                )}
                {step.id === "work" && (
                  <WorkStep
                    value={answers.work}
                    onChange={(work) => setAnswers((a) => ({ ...a, work }))}
                  />
                )}
              </StepCard>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <WizardFooter
        onBack={goBack}
        onNext={goNext}
        canGoBack={index > 0}
        canGoNext={isStepValid(step)}
        isLast={index === steps.length - 1}
      />
    </div>
  );
}
