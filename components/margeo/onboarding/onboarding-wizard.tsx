"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  MapPin,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/margeo/logo";
import {
  OnboardingProgressBar,
  OnboardingSegmentControl,
  OnboardingSelectCard,
  OnboardingSlider,
  OnboardingStepHeader,
  OnboardingSummaryRow,
} from "@/components/margeo/onboarding/onboarding-primitives";
import {
  DEFAULT_ONBOARDING_DRAFT,
  EMPTY_RETURN_OPTIONS,
  type EmptyReturnPreference,
  type OnboardingDraft,
  type OnboardingVehicleId,
  saveOnboardingDraft,
  VEHICLE_OPTIONS,
  vehicleLabel,
  emptyReturnLabel,
  weeklyHoursLabel,
  WEEKLY_HOURS_OPTIONS,
  type WeeklyHoursId,
} from "@/components/margeo/onboarding/onboarding-types";
import { OnboardingVehicleIcon } from "@/components/margeo/onboarding/onboarding-vehicle-icon";
import { UBERLY_PATHS } from "@/lib/margeo/constants";
import { cn } from "@/lib/margeo/utils";

const TOTAL_STEPS = 8;
const SPRING = { type: "spring" as const, stiffness: 280, damping: 32 };

type Direction = 1 | -1;

function stepVariants(direction: Direction, reduceMotion: boolean | null) {
  if (reduceMotion) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    };
  }
  return {
    initial: {
      opacity: 0,
      x: direction * 28,
      filter: "blur(8px)",
    },
    animate: {
      opacity: 1,
      x: 0,
      filter: "blur(0px)",
    },
    exit: {
      opacity: 0,
      x: direction * -28,
      filter: "blur(8px)",
    },
  };
}

function validateStep(step: number, draft: OnboardingDraft): string | null {
  switch (step) {
    case 0:
      return null;
    case 1:
      return draft.vehicle ? null : "Choisis ton véhicule pour continuer.";
    case 2:
    case 3:
    case 5:
      return null;
    case 4:
      return draft.emptyReturns
        ? null
        : "Indique si tu acceptes les retours à vide.";
    case 6:
      return draft.weeklyHours
        ? null
        : "Indique combien d'heures tu travailles par semaine.";
    case 7:
      if (!draft.vehicle) return "Choisis ton véhicule pour continuer.";
      if (!draft.emptyReturns) return "Indique si tu acceptes les retours à vide.";
      if (!draft.weeklyHours) return "Indique combien d'heures tu travailles par semaine.";
      return null;
    default:
      return null;
  }
}

function applySkipDefaults(step: number, draft: OnboardingDraft): OnboardingDraft {
  switch (step) {
    case 1:
      return { ...draft, vehicle: draft.vehicle ?? "scooter" };
    case 4:
      return { ...draft, emptyReturns: draft.emptyReturns ?? "short_only" };
    case 6:
      return { ...draft, weeklyHours: draft.weeklyHours ?? "20_30" };
    default:
      return draft;
  }
}

export function OnboardingWizard() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<Direction>(1);
  const [draft, setDraft] = useState<OnboardingDraft>(DEFAULT_ONBOARDING_DRAFT);
  const [finishing, setFinishing] = useState(false);

  const updateDraft = useCallback(
    (patch: Partial<OnboardingDraft>) => {
      setDraft((prev) => ({ ...prev, ...patch }));
    },
    [],
  );

  const goTo = (next: number, dir: Direction) => {
    setDirection(dir);
    setStep(next);
  };

  const handleBack = () => {
    if (step === 0) return;
    goTo(step - 1, -1);
  };

  const handleContinue = () => {
    const error = validateStep(step, draft);
    if (error) {
      toast.error(error);
      return;
    }

    if (step === TOTAL_STEPS - 1) {
      setFinishing(true);
      saveOnboardingDraft(draft);
      router.push(`${UBERLY_PATHS.analyse}?welcome=1`);
      return;
    }

    goTo(step + 1, 1);
  };

  const handleSkip = () => {
    if (step === 0 || step === TOTAL_STEPS - 1) return;
    const nextDraft = applySkipDefaults(step, draft);
    setDraft(nextDraft);
    goTo(step + 1, 1);
  };

  const isWelcome = step === 0;
  const isSummary = step === TOTAL_STEPS - 1;
  const showSkip = step > 0 && step < TOTAL_STEPS - 1;

  return (
    <div className="onboarding-shell mx-auto flex w-full max-w-lg flex-col">
      <motion.header
        className="onboarding-header shrink-0"
        initial={reduceMotion ? false : { opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
      >
        <Link href={UBERLY_PATHS.home} className="inline-flex">
          <Logo size="sm" />
        </Link>
        {!isWelcome && (
          <OnboardingProgressBar step={step} total={TOTAL_STEPS} />
        )}
      </motion.header>

      <div className="onboarding-card relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="auth-card-shine" aria-hidden />

        <div className="onboarding-card-body relative z-[1] flex flex-1 flex-col">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={stepVariants(direction, reduceMotion)}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={SPRING}
              className="flex flex-1 flex-col"
            >
              {step === 0 && <WelcomeStep />}
              {step === 1 && (
                <VehicleStep
                  value={draft.vehicle}
                  onChange={(vehicle) => updateDraft({ vehicle })}
                />
              )}
              {step === 2 && (
                <HourlyStep
                  value={draft.targetHourly}
                  onChange={(targetHourly) => updateDraft({ targetHourly })}
                />
              )}
              {step === 3 && (
                <MinBenefitStep
                  value={draft.minBenefit}
                  onChange={(minBenefit) => updateDraft({ minBenefit })}
                />
              )}
              {step === 4 && (
                <EmptyReturnsStep
                  value={draft.emptyReturns}
                  onChange={(emptyReturns) => updateDraft({ emptyReturns })}
                />
              )}
              {step === 5 && (
                <MaxDistanceStep
                  value={draft.maxDistanceKm}
                  onChange={(maxDistanceKm) => updateDraft({ maxDistanceKm })}
                />
              )}
              {step === 6 && (
                <WeeklyHoursStep
                  value={draft.weeklyHours}
                  onChange={(weeklyHours) => updateDraft({ weeklyHours })}
                />
              )}
              {step === 7 && <SummaryStep draft={draft} />}
            </motion.div>
          </AnimatePresence>
        </div>

        <footer className="onboarding-footer relative z-[1] shrink-0">
          <div className="onboarding-footer-inner">
            {!isWelcome ? (
              <motion.button
                type="button"
                onClick={handleBack}
                whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                transition={SPRING}
                className="onboarding-nav-btn onboarding-nav-btn-ghost"
              >
                <ArrowLeft className="size-4" aria-hidden />
                Retour
              </motion.button>
            ) : (
              <span className="w-[88px]" aria-hidden />
            )}

            {showSkip ? (
              <motion.button
                type="button"
                onClick={handleSkip}
                whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                transition={SPRING}
                className="onboarding-nav-btn onboarding-nav-btn-skip"
              >
                Passer
              </motion.button>
            ) : (
              <span className="w-[72px]" aria-hidden />
            )}

            <motion.button
              type="button"
              onClick={handleContinue}
              disabled={finishing}
              whileHover={finishing || reduceMotion ? undefined : { scale: 1.02 }}
              whileTap={finishing || reduceMotion ? undefined : { scale: 0.98 }}
              transition={SPRING}
              className={cn(
                "onboarding-nav-btn onboarding-nav-btn-primary",
                isSummary && "onboarding-nav-btn-finish",
              )}
            >
              {isSummary ? (
                finishing ? (
                  "Chargement…"
                ) : (
                  "Commencer à analyser mes courses"
                )
              ) : (
                <>
                  Continuer
                  <ArrowRight className="size-4" aria-hidden />
                </>
              )}
            </motion.button>
          </div>
        </footer>
      </div>
    </div>
  );
}

function WelcomeStep() {
  return (
    <div className="onboarding-welcome flex flex-1 flex-col items-center justify-center text-center">
      <motion.div
        className="onboarding-welcome-icon"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ ...SPRING, delay: 0.05 }}
      >
        <Sparkles className="size-7 text-mg-accent" strokeWidth={1.75} />
      </motion.div>
      <OnboardingStepHeader
        title="Bienvenue sur Uberly"
        subtitle="Quelques questions pour calibrer tes analyses et te donner des verdicts adaptés à ta réalité de livreur."
      />
      <ul className="onboarding-welcome-list mt-8 space-y-3 text-left">
        {[
          "Verdict clair avant chaque course",
          "Gain net réel, pas le montant affiché",
          "Objectifs personnalisés à ton rythme",
        ].map((item, i) => (
          <motion.li
            key={item}
            className="onboarding-welcome-item"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...SPRING, delay: 0.12 + i * 0.06 }}
          >
            <span className="onboarding-welcome-dot" aria-hidden />
            {item}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

function VehicleStep({
  value,
  onChange,
}: {
  value: OnboardingVehicleId | null;
  onChange: (vehicle: OnboardingVehicleId) => void;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <OnboardingStepHeader
        title="Quel véhicule utilises-tu ?"
        subtitle="On ajuste les coûts et la rentabilité selon ton mode de transport."
      />
      <div className="onboarding-vehicle-grid mt-8">
        {VEHICLE_OPTIONS.map((option) => (
          <OnboardingSelectCard
            key={option.id}
            selected={value === option.id}
            onSelect={() => onChange(option.id)}
            icon={
              <OnboardingVehicleIcon
                vehicle={option.id}
                selected={value === option.id}
              />
            }
            label={option.label}
          />
        ))}
      </div>
    </div>
  );
}

function HourlyStep({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <OnboardingStepHeader
        title="Quel est ton objectif horaire ?"
        subtitle="Le taux net visé pour juger si une course vaut le coup."
      />
      <div className="mt-10 flex flex-1 flex-col justify-center">
        <OnboardingSlider
          value={value}
          onChange={onChange}
          min={12}
          max={35}
          step={1}
          formatValue={(v) => `${v} €/h`}
          minLabel="12 €"
          maxLabel="35 €"
        />
      </div>
    </div>
  );
}

function MinBenefitStep({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <OnboardingStepHeader
        title="Quel bénéfice minimum souhaites-tu ?"
        subtitle="Le gain net minimum acceptable par course, après tes coûts."
      />
      <div className="mt-10 flex flex-1 flex-col justify-center">
        <OnboardingSlider
          value={value}
          onChange={onChange}
          min={3}
          max={15}
          step={0.5}
          formatValue={(v) => `${v.toLocaleString("fr-FR", { minimumFractionDigits: v % 1 ? 1 : 0, maximumFractionDigits: 1 })} €`}
          minLabel="3 €"
          maxLabel="15 €"
        />
      </div>
    </div>
  );
}

function EmptyReturnsStep({
  value,
  onChange,
}: {
  value: EmptyReturnPreference | null;
  onChange: (value: EmptyReturnPreference) => void;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <OnboardingStepHeader
        title="Acceptes-tu les retours à vide ?"
        subtitle="Les km sans client après une livraison impactent fortement ta rentabilité."
      />
      <div className="mt-10 flex flex-1 flex-col justify-center">
        <OnboardingSegmentControl
          value={value}
          onChange={onChange}
          options={EMPTY_RETURN_OPTIONS}
        />
      </div>
    </div>
  );
}

function MaxDistanceStep({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <OnboardingStepHeader
        title="Distance maximale souhaitée"
        subtitle="Au-delà, on te signalera que la course mérite une vérification."
      />
      <div className="mt-10 flex flex-1 flex-col justify-center">
        <OnboardingSlider
          value={value}
          onChange={onChange}
          min={2}
          max={20}
          step={1}
          formatValue={(v) => `${v} km`}
          minLabel="2 km"
          maxLabel="20 km"
        />
      </div>
    </div>
  );
}

function WeeklyHoursStep({
  value,
  onChange,
}: {
  value: WeeklyHoursId | null;
  onChange: (value: WeeklyHoursId) => void;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <OnboardingStepHeader
        title="Combien d'heures travailles-tu par semaine ?"
        subtitle="Pour contextualiser tes objectifs et ton rythme de livraison."
      />
      <div className="onboarding-hours-grid mt-8">
        {WEEKLY_HOURS_OPTIONS.map((option) => (
          <OnboardingSelectCard
            key={option.id}
            selected={value === option.id}
            onSelect={() => onChange(option.id)}
            icon={<Clock className="size-5" strokeWidth={1.75} />}
            label={option.label}
            description={option.description}
            className="onboarding-hours-card"
          />
        ))}
      </div>
    </div>
  );
}

function SummaryStep({ draft }: { draft: OnboardingDraft }) {
  return (
    <div className="flex flex-1 flex-col">
      <OnboardingStepHeader
        title="Résumé"
        subtitle="Vérifie tes préférences avant de lancer ta première analyse."
      />
      <div className="onboarding-summary mt-8 space-y-1">
        <OnboardingSummaryRow
          label="Véhicule"
          value={vehicleLabel(draft.vehicle)}
        />
        <OnboardingSummaryRow
          label="Objectif horaire"
          value={`${draft.targetHourly} €/h net`}
        />
        <OnboardingSummaryRow
          label="Bénéfice minimum"
          value={`${draft.minBenefit.toLocaleString("fr-FR")} €`}
        />
        <OnboardingSummaryRow
          label="Retours à vide"
          value={emptyReturnLabel(draft.emptyReturns)}
        />
        <OnboardingSummaryRow
          label="Distance max."
          value={`${draft.maxDistanceKm} km`}
        />
        <OnboardingSummaryRow
          label="Heures / semaine"
          value={weeklyHoursLabel(draft.weeklyHours)}
        />
      </div>
      <div className="onboarding-summary-hints mt-6 grid gap-2 sm:grid-cols-3">
        {[
          { icon: Target, text: "Verdicts calibrés" },
          { icon: TrendingUp, text: "Objectifs clairs" },
          { icon: MapPin, text: "Courses adaptées" },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="onboarding-summary-chip">
            <Icon className="size-3.5 text-mg-accent" strokeWidth={2} />
            <span>{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
