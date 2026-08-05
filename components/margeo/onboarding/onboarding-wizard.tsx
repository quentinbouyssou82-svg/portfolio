"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
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
import { Button } from "@/components/margeo/ui/button";
import { DRIVEELY_PATHS } from "@/lib/margeo/constants";
import { cn } from "@/lib/margeo/utils";
import {
  completeOnboardingAndRedirect,
  saveOnboardingProgressAction,
} from "@/lib/margeo/actions/onboarding";
import type { OnboardingInput } from "@/lib/margeo/supabase/schema";
import type { Vehicle } from "@/lib/margeo/types";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  MapPin,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

const TOTAL_STEPS = 8;

function validateStep(step: number, draft: OnboardingDraft): string | null {
  switch (step) {
    case 0:
      return null;
    case 1:
      return draft.vehicle ? null : "Choisis ton véhicule.";
    case 2:
    case 3:
    case 5:
      return null;
    case 4:
      return draft.emptyReturns
        ? null
        : "Retours à vide : oui ou non ?";
    case 6:
      return draft.weeklyHours
        ? null
        : "Combien d'heures par semaine ?";
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
      return { ...draft, vehicle: draft.vehicle ?? "scooter_thermique" };
    case 4:
      return { ...draft, emptyReturns: draft.emptyReturns ?? "short_only" };
    case 6:
      return { ...draft, weeklyHours: draft.weeklyHours ?? "20_30" };
    default:
      return draft;
  }
}

export function OnboardingWizard({
  initial,
}: {
  initial?: Partial<OnboardingDraft>;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<OnboardingDraft>({
    ...DEFAULT_ONBOARDING_DRAFT,
    ...initial,
  });
  const [finishing, setFinishing] = useState(false);
  const [pending, startTransition] = useTransition();

  const updateDraft = useCallback(
    (patch: Partial<OnboardingDraft>) => {
      setDraft((prev) => ({ ...prev, ...patch }));
    },
    [],
  );

  const goTo = (next: number) => {
    setStep(next);
  };

  const handleBack = () => {
    if (step === 0) return;
    goTo(step - 1);
  };

  const persistDraft = useCallback(async (nextDraft: OnboardingDraft) => {
    const patch: Partial<OnboardingInput> = {};
    if (nextDraft.vehicle) patch.vehicle = nextDraft.vehicle as Vehicle;
    if (nextDraft.targetHourly) patch.targetHourly = nextDraft.targetHourly;
    if (nextDraft.minBenefit) patch.minBenefit = nextDraft.minBenefit;
    if (nextDraft.maxDistanceKm) patch.maxDistanceKm = nextDraft.maxDistanceKm;
    if (nextDraft.emptyReturns) patch.emptyReturns = nextDraft.emptyReturns;
    if (nextDraft.weeklyHours) patch.weeklyHours = nextDraft.weeklyHours;

    if (Object.keys(patch).length === 0) return;
    await saveOnboardingProgressAction(patch);
  }, []);

  const handleContinue = () => {
    const error = validateStep(step, draft);
    if (error) {
      toast.error(error);
      return;
    }

    if (step === TOTAL_STEPS - 1) {
      const input = draftToInput(draft);
      if (!input) {
        toast.error("Complète toutes les étapes avant de continuer.");
        return;
      }

      setFinishing(true);
      startTransition(async () => {
        const result = await completeOnboardingAndRedirect(input);
        if (!result.ok) {
          setFinishing(false);
          toast.error(result.message);
          return;
        }
        if (result.redirectTo) {
          window.location.assign(result.redirectTo);
          return;
        }
        router.refresh();
      });
      return;
    }

    const nextDraft = draft;
    void persistDraft(nextDraft);
    goTo(step + 1);
  };

  const handleSkip = () => {
    if (step === 0 || step === TOTAL_STEPS - 1) return;
    const nextDraft = applySkipDefaults(step, draft);
    setDraft(nextDraft);
    goTo(step + 1);
  };

  const isWelcome = step === 0;
  const isSummary = step === TOTAL_STEPS - 1;
  const showSkip = step > 0 && step < TOTAL_STEPS - 1;

  return (
    <div className="onboarding-shell mx-auto flex w-full max-w-lg flex-col">
      <header className="onboarding-header shrink-0 app-fade-in">
        <Link href={DRIVEELY_PATHS.home} className="inline-flex">
          <Logo size="sm" />
        </Link>
        {!isWelcome && (
          <OnboardingProgressBar step={step} total={TOTAL_STEPS} />
        )}
      </header>

      <div className="onboarding-card relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="auth-card-shine" aria-hidden />

        <div className="onboarding-card-body relative z-[1] flex flex-1 flex-col">
          <div key={step} className="app-fade-in flex flex-1 flex-col">
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
          </div>
        </div>

        <footer className="onboarding-footer relative z-[1] shrink-0">
          <div className="onboarding-footer-inner">
            {!isWelcome ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleBack}
                className="justify-self-start px-3"
              >
                <ArrowLeft className="size-4" aria-hidden />
                Retour
              </Button>
            ) : (
              <span className="w-[88px]" aria-hidden />
            )}

            {showSkip ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="justify-self-center px-2"
              >
                Passer
              </Button>
            ) : (
              <span className="w-[72px]" aria-hidden />
            )}

            <Button
              type="button"
              onClick={handleContinue}
              disabled={
                finishing || pending || Boolean(validateStep(step, draft))
              }
              loading={finishing || pending}
              size="sm"
              className={cn(
                "justify-self-end whitespace-normal text-center leading-tight",
                isSummary && "onboarding-nav-btn-finish px-3 text-xs sm:text-sm",
              )}
            >
              {isSummary ? (
                finishing || pending ? (
                  "Enregistrement…"
                ) : (
                  "Lancer l'analyse"
                )
              ) : (
                <>
                  Continuer
                  <ArrowRight className="size-4" aria-hidden />
                </>
              )}
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}

function draftToInput(draft: OnboardingDraft): OnboardingInput | null {
  if (!draft.vehicle || !draft.emptyReturns || !draft.weeklyHours) {
    return null;
  }

  return {
    vehicle: draft.vehicle as Vehicle,
    targetHourly: draft.targetHourly,
    minBenefit: draft.minBenefit,
    emptyReturns: draft.emptyReturns,
    maxDistanceKm: draft.maxDistanceKm,
    weeklyHours: draft.weeklyHours,
  };
}

function WelcomeStep() {
  return (
    <div className="onboarding-welcome flex flex-1 flex-col items-center justify-center text-center">
      <div className="onboarding-welcome-icon">
        <Sparkles className="size-7 text-mg-accent" strokeWidth={1.75} />
      </div>
      <OnboardingStepHeader
        title="Bienvenue"
        subtitle="4 questions pour calibrer tes verdicts."
      />
      <ul className="onboarding-welcome-list mt-8 space-y-3 text-left">
        {[
          "Verdict en ~2,5 s",
          "Gain net, pas le montant affiché",
          "Adapté à ton rythme",
        ].map((item) => (
          <li key={item} className="onboarding-welcome-item">
            <span className="onboarding-welcome-dot" aria-hidden />
            {item}
          </li>
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
        subtitle="On ajuste tes coûts selon ton véhicule."
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
        subtitle="Ton €/h net cible pour juger chaque course."
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
        subtitle="Le gain net minimum acceptable par course."
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
        subtitle="Les km à vide impactent fortement ta marge."
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
        subtitle="Au-delà, on te signale de vérifier."
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
        subtitle="Pour calibrer tes objectifs."
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
        subtitle="Vérifie avant de lancer ta première analyse."
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
          { icon: MapPin, text: "Courses filtrées" },
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
