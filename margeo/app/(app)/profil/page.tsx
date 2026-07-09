"use client";

import { Bike, Car, Crown, Moon, Save } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { DEMO_PROFILE } from "@/lib/data";
import { VEHICLE_LABELS, type Vehicle } from "@/lib/types";
import { cn } from "@/lib/utils";

const VEHICLE_OPTIONS: { value: Vehicle; icon: typeof Bike }[] = [
  { value: "velo", icon: Bike },
  { value: "scooter", icon: Bike },
  { value: "voiture", icon: Car },
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
      <span className="text-sm font-medium text-foreground">{label}</span>
      {hint && <span className="mt-0.5 block text-xs text-faint">{hint}</span>}
      <div className="mt-2">{children}</div>
    </label>
  );
}

export default function ProfilPage() {
  const [profile, setProfile] = useState(DEMO_PROFILE);
  const [darkMode, setDarkMode] = useState(true);

  const update = <K extends keyof typeof profile>(
    key: K,
    value: (typeof profile)[K]
  ) => setProfile((p) => ({ ...p, [key]: value }));

  const save = () => {
    toast.success("Profil mis à jour", {
      description: "Tes prochaines analyses utiliseront ces paramètres.",
    });
  };

  return (
    <div className="animate-fade-up mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Profil
        </h1>
        <p className="mt-1 text-sm text-muted">
          Ces paramètres calibrent le moteur d&apos;analyse : plus ils sont
          justes, plus les verdicts le sont.
        </p>
      </div>

      {/* Identité */}
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
              <div className="grid grid-cols-3 gap-2">
                {VEHICLE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => update("vehicle", option.value)}
                    className={cn(
                      "flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border py-3.5 text-sm font-medium transition-all duration-200",
                      profile.vehicle === option.value
                        ? "border-accent/50 bg-accent-soft text-accent"
                        : "border-border text-muted hover:border-border-strong hover:text-foreground"
                    )}
                  >
                    <option.icon className="size-5" />
                    {VEHICLE_LABELS[option.value]}
                  </button>
                ))}
              </div>
            </Field>
          </div>
        </CardContent>
      </Card>

      {/* Paramètres de rentabilité */}
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
              <span className="absolute top-1/2 right-3.5 -translate-y-1/2 text-sm text-faint">
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
              <span className="absolute top-1/2 right-3.5 -translate-y-1/2 text-sm text-faint">
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
              <span className="absolute top-1/2 right-3.5 -translate-y-1/2 text-sm text-faint">
                €
              </span>
            </div>
          </Field>
        </CardContent>
      </Card>

      {/* Préférences */}
      <Card>
        <CardHeader>
          <CardTitle>Préférences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-lg bg-white/[0.05]">
                <Moon className="size-4 text-muted" />
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Mode sombre
                </p>
                <p className="text-xs text-faint">
                  Margeo est conçu pour la nuit. On te déconseille de l&apos;éteindre.
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
                    description:
                      "Le mode clair arrive dans une prochaine version.",
                  });
                }
              }}
              aria-label="Mode sombre"
            />
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-accent/25 bg-accent-soft/50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-lg bg-accent-soft">
                <Crown className="size-4 text-accent" />
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Compte {profile.premium ? "Premium" : "Gratuit"}
                </p>
                <p className="text-xs text-faint">
                  {profile.premium
                    ? "Analyses illimitées et statistiques avancées activées."
                    : "5 analyses par jour. Passe en illimité avec Premium."}
                </p>
              </div>
            </div>
            {!profile.premium && (
              <Link href="/premium">
                <Button variant="secondary" size="sm">
                  Découvrir Premium
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save}>
          <Save />
          Enregistrer les modifications
        </Button>
      </div>
    </div>
  );
}
