"use client";

import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/margeo/logo";
import { VehicleIcon } from "@/components/margeo/vehicle-icon";
import { Button } from "@/components/margeo/ui/button";
import { Input } from "@/components/margeo/ui/input";
import { completeOnboardingAction } from "@/lib/margeo/actions/onboarding";
import {
  DEFAULT_VEHICLE_COSTS,
  ONBOARDING_PLATFORMS,
  UBERLY_PATHS,
} from "@/lib/margeo/constants";
import { trackMargeoEvent } from "@/lib/margeo/analytics";
import type { Platform, Vehicle } from "@/lib/margeo/types";
import { VEHICLE_LABELS } from "@/lib/margeo/types";
import { cn } from "@/lib/margeo/utils";

const STEPS = [
  "Prénom",
  "Ville",
  "Plateformes",
  "Véhicule",
  "Objectifs",
] as const;

const VEHICLES: Vehicle[] = [
  "velo",
  "velo_electrique",
  "scooter",
  "voiture",
];

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [pending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [otherPlatform, setOtherPlatform] = useState("");
  const [vehicle, setVehicle] = useState<Vehicle>("scooter");
  const [targetHourly, setTargetHourly] = useState(16);
  const [dailyTarget, setDailyTarget] = useState(90);

  const togglePlatform = (p: Platform) => {
    setPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    );
  };

  const next = () => {
    if (step === 0 && !name.trim()) {
      toast.error("Indique ton prénom.");
      return;
    }
    if (step === 1 && !city.trim()) {
      toast.error("Indique ta ville.");
      return;
    }
    if (step === 2 && platforms.length === 0) {
      toast.error("Sélectionne au moins une plateforme.");
      return;
    }
    if (step === 2 && platforms.includes("Autre") && !otherPlatform.trim()) {
      toast.error("Précise ta plateforme « Autre ».");
      return;
    }
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
      return;
    }

    startTransition(async () => {
      const result = await completeOnboardingAction({
        name: name.trim(),
        city: city.trim(),
        vehicle,
        platforms,
        otherPlatform: platforms.includes("Autre") ? otherPlatform.trim() : undefined,
        targetHourly,
        dailyTarget,
        costPerKm: DEFAULT_VEHICLE_COSTS[vehicle],
      });

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      trackMargeoEvent("margeo_onboarding_completed", {
        city,
        vehicle,
        platforms: platforms.join(","),
        target_hourly: targetHourly,
      });

      toast.success("C'est parti !", {
        description: "Analyse ta première course maintenant.",
      });
      router.push(`${UBERLY_PATHS.analyse}?welcome=1`);
      router.refresh();
    });
  };

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-8 text-center">
        <Logo />
        <h1 className="mt-6 text-2xl font-bold text-mg-foreground">
          Configure ton profil
        </h1>
        <p className="mt-2 text-sm text-mg-muted">
          {step === STEPS.length - 1
            ? "Dernière étape — ensuite, analyse ta première course."
            : `Étape ${step + 1} sur ${STEPS.length} — ${STEPS[step]}`}
        </p>
        <div className="mt-4 flex justify-center gap-1.5">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 w-6 rounded-full transition-colors sm:w-8",
                i <= step ? "bg-mg-accent" : "bg-mg-border",
              )}
            />
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-mg-border bg-mg-card p-6">
        {step === 0 && (
          <label className="block">
            <span className="text-sm font-medium text-mg-foreground">Prénom</span>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Karim"
              className="mt-3"
              autoFocus
            />
          </label>
        )}

        {step === 1 && (
          <label className="block">
            <span className="text-sm font-medium text-mg-foreground">
              Dans quelle ville livres-tu ?
            </span>
            <Input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Lyon, Paris, Marseille…"
              className="mt-3"
              autoFocus
            />
          </label>
        )}

        {step === 2 && (
          <div>
            <p className="text-sm font-medium text-mg-foreground">
              Quelles plateformes utilises-tu ?
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[...ONBOARDING_PLATFORMS, "Autre" as Platform].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePlatform(p)}
                  className={cn(
                    "cursor-pointer rounded-full border px-3.5 py-2.5 text-xs font-medium transition-colors min-h-11",
                    platforms.includes(p)
                      ? "border-mg-accent/40 bg-mg-accent-soft text-mg-accent"
                      : "border-mg-border text-mg-muted hover:border-mg-border-strong",
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
            {platforms.includes("Autre") && (
              <Input
                value={otherPlatform}
                onChange={(e) => setOtherPlatform(e.target.value)}
                placeholder="Nom de la plateforme"
                className="mt-3"
              />
            )}
          </div>
        )}

        {step === 3 && (
          <div>
            <p className="text-sm font-medium text-mg-foreground">
              Quel véhicule utilises-tu ?
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {VEHICLES.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVehicle(v)}
                  className={cn(
                    "flex cursor-pointer flex-col items-center gap-2 rounded-xl border py-4 text-xs font-medium transition-colors min-h-[72px] sm:text-sm",
                    vehicle === v
                      ? "border-mg-accent/50 bg-mg-accent-soft text-mg-accent"
                      : "border-mg-border text-mg-muted hover:border-mg-border-strong",
                  )}
                >
                  <VehicleIcon vehicle={v} selected={vehicle === v} />
                  {VEHICLE_LABELS[v]}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-mg-faint">
              Coût estimé : {DEFAULT_VEHICLE_COSTS[vehicle]} €/km
            </p>
          </div>
        )}

        {step === 4 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-mg-foreground">
                Objectif €/h net
              </span>
              <div className="relative mt-2">
                <Input
                  type="number"
                  min={8}
                  max={50}
                  value={targetHourly}
                  onChange={(e) => setTargetHourly(Number(e.target.value))}
                />
                <span className="absolute top-1/2 right-3 -translate-y-1/2 text-xs text-mg-faint">
                  €/h
                </span>
              </div>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-mg-foreground">
                Objectif journalier
              </span>
              <div className="relative mt-2">
                <Input
                  type="number"
                  min={20}
                  step={5}
                  value={dailyTarget}
                  onChange={(e) => setDailyTarget(Number(e.target.value))}
                />
                <span className="absolute top-1/2 right-3 -translate-y-1/2 text-xs text-mg-faint">
                  €
                </span>
              </div>
            </label>
          </div>
        )}

        <div className="mt-6 flex justify-between">
          {step > 0 ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => setStep((s) => s - 1)}
              className="min-h-11"
            >
              Retour
            </Button>
          ) : (
            <span />
          )}
          <Button type="button" onClick={next} disabled={pending} className="min-h-11">
            {step === STEPS.length - 1 ? (
              pending ? "Enregistrement…" : "Terminer"
            ) : (
              <>
                Suivant
                <ChevronRight className="size-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
