"use client";

import { Crown, Moon, Save } from "lucide-react";
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
      {hint && <span className="mt-0.5 block text-xs text-mg-faint">{hint}</span>}
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
      toast.success("Profil mis à jour", {
        description: "Tes prochaines analyses utiliseront ces paramètres.",
      });
    });
  };

  return (
    <div className="animate-mg-fade-up mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-mg-foreground">
          Profil
        </h1>
        <p className="mt-1 text-sm text-mg-muted">
          Ces paramètres calibrent le moteur d&apos;analyse : plus ils sont
          justes, plus les verdicts le sont.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <Field label="Nom">
            <Input
              value={profile.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </Field>
          <Field label="Ville">
            <Input
              value={profile.city}
              onChange={(e) => update("city", e.target.value)}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Véhicule" hint="Impacte ton coût au kilomètre.">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {VEHICLE_OPTIONS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => update("vehicle", v)}
                    className={cn(
                      "flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border py-3.5 text-xs font-medium transition-all duration-200 sm:text-sm",
                      profile.vehicle === v
                        ? "border-mg-accent/50 bg-mg-accent-soft text-mg-accent"
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
                      "cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-all",
                      profile.platforms?.includes(p)
                        ? "border-mg-accent/40 bg-mg-accent-soft text-mg-accent"
                        : "border-mg-border text-mg-muted",
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
          <CardTitle>Rentabilité</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-3">
          <Field label="Coût / km" hint="Carburant, usure, assurance.">
            <div className="relative">
              <Input
                type="number"
                step="0.01"
                min="0"
                value={profile.costPerKm}
                onChange={(e) => update("costPerKm", Number(e.target.value))}
                className="pr-8"
              />
              <span className="absolute top-1/2 right-3.5 -translate-y-1/2 text-sm text-mg-faint">
                €
              </span>
            </div>
          </Field>
          <Field label="Objectif €/h" hint="Ton taux horaire net minimum.">
            <div className="relative">
              <Input
                type="number"
                step="1"
                min="0"
                value={profile.targetHourly}
                onChange={(e) => update("targetHourly", Number(e.target.value))}
                className="pr-12"
              />
              <span className="absolute top-1/2 right-3.5 -translate-y-1/2 text-sm text-mg-faint">
                €/h
              </span>
            </div>
          </Field>
          <Field label="Objectif gain / jour" hint="Ta cible de gain net.">
            <div className="relative">
              <Input
                type="number"
                step="5"
                min="0"
                value={profile.dailyTarget}
                onChange={(e) => update("dailyTarget", Number(e.target.value))}
                className="pr-8"
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
          <CardTitle>Préférences</CardTitle>
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
                  Margeo est conçu pour la nuit.
                </p>
              </div>
            </div>
            <Switch
              checked={darkMode}
              onCheckedChange={(checked) => {
                setDarkMode(checked);
                if (!checked) {
                  setTimeout(() => setDarkMode(true), 900);
                  toast("Petit joueur 😎", {
                    description: "Le mode clair arrive dans une prochaine version.",
                  });
                }
              }}
              aria-label="Mode sombre"
            />
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-mg-accent/25 bg-mg-accent-soft/50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-lg bg-mg-accent-soft">
                <Crown className="size-4 text-mg-accent" />
              </span>
              <div>
                <p className="text-sm font-medium text-mg-foreground">
                  Compte {profile.premium ? "Premium" : "Gratuit"}
                </p>
                <p className="text-xs text-mg-faint">
                  {profile.premium
                    ? "Analyses illimitées activées."
                    : "Beta gratuite — analyses illimitées pendant les tests."}
                </p>
              </div>
            </div>
            {!profile.premium && (
              <Link href={margeoRoutes.premium}>
                <Button variant="secondary" size="sm">
                  Découvrir Premium
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save} disabled={pending}>
          <Save />
          {pending ? "Enregistrement…" : "Enregistrer les modifications"}
        </Button>
      </div>
    </div>
  );
}
