"use client";

import { Crown, Moon, Save, Target } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/margeo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/margeo/ui/card";
import { Input } from "@/components/margeo/ui/input";
import { Switch } from "@/components/margeo/ui/switch";
import { updateProfileAction } from "@/lib/margeo/actions/profile";
import { VehicleIcon } from "@/components/margeo/vehicle-icon";
import { ONBOARDING_PLATFORMS } from "@/lib/margeo/constants";
import { trackMargeoEvent } from "@/lib/margeo/analytics";
import { margeoRoutes } from "@/lib/margeo/routes";
import {
  VEHICLE_LABELS,
  type Platform,
  type UserProfile,
  type Vehicle,
} from "@/lib/margeo/types";
import { cn } from "@/lib/margeo/utils";

const VEHICLE_OPTIONS: Vehicle[] = [
  "velo",
  "velo_electrique",
  "scooter",
  "voiture",
];

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-mg-foreground">{label}</span>
      {hint && (
        <span className="mt-0.5 block text-xs text-mg-faint">{hint}</span>
      )}
      <div className="mt-2">{children}</div>
    </label>
  );
}

export function ProfilForm({ initialProfile }: { initialProfile: UserProfile }) {
  const [profile, setProfile] = useState(initialProfile);
  const [darkMode, setDarkMode] = useState(true);
  const [pending, startTransition] = useTransition();

  const update = <K extends keyof UserProfile>(
    key: K,
    value: UserProfile[K],
  ) => setProfile((p) => ({ ...p, [key]: value }));

  const togglePlatform = (p: Platform) => {
    const current = profile.platforms ?? [];
    update(
      "platforms",
      current.includes(p)
        ? current.filter((x) => x !== p)
        : [...current, p],
    );
  };

  const save = () => {
    startTransition(async () => {
      const result = await updateProfileAction(profile);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      if (result.data) setProfile(result.data);
      trackMargeoEvent("margeo_profile_updated");
      toast.success("Profil enregistré", {
        description: "Tes prochaines analyses utiliseront ces paramètres.",
      });
    });
  };

  return (
    <div className="animate-mg-fade-up mx-auto max-w-2xl space-y-6 pb-24 lg:pb-6">
      <div>
        <p className="text-xs font-medium tracking-wide text-mg-faint uppercase">
          Profil
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-mg-foreground sm:text-3xl">
          Tes paramètres
        </h1>
        <p className="mt-1 text-sm text-mg-muted">
          Plus c&apos;est précis, plus les verdicts Uberly sont fiables.
        </p>
      </div>

      {/* Aperçu objectifs */}
      <Card className="border-mg-accent/20 bg-mg-accent-soft/10 p-5">
        <div className="flex items-center gap-4">
          <span className="flex size-14 items-center justify-center rounded-2xl border border-mg-accent/25 bg-mg-accent-soft">
            <Target className="size-6 text-mg-accent" />
          </span>
          <div>
            <p className="text-sm font-semibold text-mg-foreground">
              Tes objectifs actuels
            </p>
            <p className="mt-1 text-sm text-mg-muted">
              <span className="font-semibold text-mg-foreground">
                {profile.targetHourly} €/h
              </span>{" "}
              net minimum ·{" "}
              <span className="font-semibold text-mg-foreground">
                {profile.dailyTarget} €
              </span>{" "}
              / jour
            </p>
            <p className="mt-0.5 text-xs text-mg-faint">
              {VEHICLE_LABELS[profile.vehicle]} · {profile.costPerKm} €/km
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informations</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <Field label="Prénom">
            <Input
              value={profile.name}
              onChange={(e) => update("name", e.target.value)}
              className="min-h-11"
            />
          </Field>
          <Field label="Ville">
            <Input
              value={profile.city}
              onChange={(e) => update("city", e.target.value)}
              className="min-h-11"
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Véhicule" hint="Détermine ton coût au kilomètre.">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {VEHICLE_OPTIONS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => update("vehicle", v)}
                    className={cn(
                      "flex min-h-[88px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border py-3 text-xs font-medium transition-all sm:text-sm",
                      profile.vehicle === v
                        ? "border-mg-accent/50 bg-mg-accent-soft text-mg-accent shadow-[0_0_0_1px_rgba(129,140,248,0.2)]"
                        : "border-mg-border text-mg-muted hover:border-mg-border-strong hover:text-mg-foreground",
                    )}
                  >
                    <VehicleIcon vehicle={v} selected={profile.vehicle === v} />
                    {VEHICLE_LABELS[v]}
                  </button>
                ))}
              </div>
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Plateformes">
              <div className="flex flex-wrap gap-2">
                {[...ONBOARDING_PLATFORMS, "Autre" as Platform].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => togglePlatform(p)}
                    className={cn(
                      "min-h-9 cursor-pointer rounded-full border px-3.5 py-2 text-xs font-medium transition-all",
                      profile.platforms?.includes(p)
                        ? "border-mg-accent/40 bg-mg-accent-soft text-mg-accent"
                        : "border-mg-border text-mg-muted hover:border-mg-border-strong",
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rentabilité</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-3">
          <Field label="Coût / km" hint="Essence, usure, assurance.">
            <div className="relative">
              <Input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={profile.costPerKm}
                onChange={(e) => update("costPerKm", Number(e.target.value))}
                className="min-h-11 pr-8"
              />
              <span className="absolute top-1/2 right-3.5 -translate-y-1/2 text-sm text-mg-faint">
                €
              </span>
            </div>
          </Field>
          <Field label="Objectif €/h" hint="Taux horaire net minimum.">
            <div className="relative">
              <Input
                type="number"
                inputMode="numeric"
                step="1"
                min="0"
                value={profile.targetHourly}
                onChange={(e) => update("targetHourly", Number(e.target.value))}
                className="min-h-11 pr-12"
              />
              <span className="absolute top-1/2 right-3.5 -translate-y-1/2 text-sm text-mg-faint">
                €/h
              </span>
            </div>
          </Field>
          <Field label="Objectif / jour" hint="Gain net visé.">
            <div className="relative">
              <Input
                type="number"
                inputMode="numeric"
                step="5"
                min="0"
                value={profile.dailyTarget}
                onChange={(e) => update("dailyTarget", Number(e.target.value))}
                className="min-h-11 pr-8"
              />
              <span className="absolute top-1/2 right-3.5 -translate-y-1/2 text-sm text-mg-faint">
                €
              </span>
            </div>
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Préférences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-lg bg-white/[0.05]">
                <Moon className="size-4 text-mg-muted" />
              </span>
              <div>
                <p className="text-sm font-medium text-mg-foreground">
                  Mode sombre
                </p>
                <p className="text-xs text-mg-faint">
                  Uberly est optimisé pour la route de nuit.
                </p>
              </div>
            </div>
            <Switch
              checked={darkMode}
              onCheckedChange={(checked) => {
                setDarkMode(checked);
                if (!checked) {
                  setTimeout(() => setDarkMode(true), 900);
                  toast("Bientôt disponible", {
                    description: "Le mode clair arrive dans une prochaine version.",
                  });
                }
              }}
              aria-label="Mode sombre"
            />
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-mg-accent/25 bg-gradient-to-br from-mg-accent-soft/40 to-transparent p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-mg-accent-soft">
                <Crown className="size-5 text-mg-accent" />
              </span>
              <div>
                <p className="text-sm font-semibold text-mg-foreground">
                  {profile.premium ? "Compte Premium" : "Beta gratuite"}
                </p>
                <p className="text-xs text-mg-muted">
                  {profile.premium
                    ? "Analyses illimitées activées."
                    : "Analyses illimitées pendant la beta."}
                </p>
              </div>
            </div>
            {!profile.premium && (
              <Link href={margeoRoutes.premium}>
                <Button variant="secondary" size="sm" className="min-h-10 w-full sm:w-auto">
                  Découvrir Premium
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Desktop save */}
      <div className="hidden justify-end lg:flex">
        <Button onClick={save} disabled={pending} className="min-h-11">
          <Save />
          {pending ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </div>

      {/* Mobile sticky save */}
      <div className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-20 border-t border-mg-border bg-mg-background/90 p-3 backdrop-blur-xl lg:hidden">
        <Button
          onClick={save}
          disabled={pending}
          className="app-cta-primary w-full min-h-11"
        >
          <Save />
          {pending ? "Enregistrement…" : "Enregistrer les modifications"}
        </Button>
      </div>
    </div>
  );
}
