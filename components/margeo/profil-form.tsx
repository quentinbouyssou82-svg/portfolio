"use client";

import { Camera, Crown, FlaskConical, LogOut, Moon, Save, Sun, Target } from "lucide-react";
import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/margeo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/margeo/ui/card";
import { Input } from "@/components/margeo/ui/input";
import { NumericInput } from "@/components/margeo/ui/numeric-input";
import { Switch } from "@/components/margeo/ui/switch";
import { PlatformLogo } from "@/components/margeo/platform-logo";
import { VehicleIcon } from "@/components/margeo/vehicle-icon";
import { useDriveelyTheme } from "@/components/margeo/theme-provider";
import { PersonalDataSection } from "@/components/margeo/personal-data-section";
import {
  removeAvatarAction,
  updateProfileAction,
  uploadAvatarAction,
} from "@/lib/margeo/actions/profile";
import { getProfileInitials } from "@/lib/margeo/profile-display";
import { ONBOARDING_PLATFORMS, DRIVEELY_PATHS } from "@/lib/margeo/constants";
import { DRIVEELY_LIMITS } from "@/lib/margeo/constants/limits";
import { DRIVEELY_PLANS } from "@/lib/margeo/plans";
import { VEHICLE_OPTIONS } from "@/lib/margeo/vehicle-costs";
import {
  EMPTY_VEHICLE_DETAILS,
  VEHICLE_FUEL_LABELS,
  defaultFuelForVehicle,
  estimateCostPerKm,
  typicalConsumption,
  DEFAULT_ENERGY_PRICE,
  type VehicleDetails,
  type VehicleFuel,
} from "@/lib/margeo/vehicle-details";
import { trackMargeoEvent } from "@/lib/margeo/analytics";
import { margeoRoutes } from "@/lib/margeo/routes";
import {
  VEHICLE_LABELS,
  type Platform,
  type UserProfile,
  type Vehicle,
} from "@/lib/margeo/types";
import { cn } from "@/lib/margeo/utils";

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

function hydrateVehicleDetails(
  vehicle: UserProfile["vehicle"],
  raw: VehicleDetails | null | undefined,
): VehicleDetails {
  const base = { ...EMPTY_VEHICLE_DETAILS, ...(raw ?? {}) };
  if (base.fuel !== "aucun") return base;
  const fuel = defaultFuelForVehicle(vehicle);
  if (fuel === "aucun") return base;
  return {
    ...base,
    fuel,
    consumptionPer100Km:
      base.consumptionPer100Km ?? typicalConsumption(vehicle, fuel),
    energyPrice: base.energyPrice ?? DEFAULT_ENERGY_PRICE[fuel],
  };
}

export function ProfilForm({ initialProfile }: { initialProfile: UserProfile }) {
  const { theme, setTheme } = useDriveelyTheme();
  const [profile, setProfile] = useState<UserProfile>(() => {
    const vehicleDetails = hydrateVehicleDetails(
      initialProfile.vehicle,
      initialProfile.vehicleDetails,
    );
    const next: UserProfile = { ...initialProfile, vehicleDetails };
    if (!vehicleDetails.costPerKmManual) {
      next.costPerKm = estimateCostPerKm(initialProfile.vehicle, vehicleDetails);
    }
    return next;
  });
  const [pending, startTransition] = useTransition();
  const [avatarPending, setAvatarPending] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const details = profile.vehicleDetails ?? EMPTY_VEHICLE_DETAILS;

  const update = <K extends keyof UserProfile>(
    key: K,
    value: UserProfile[K],
  ) => setProfile((p) => ({ ...p, [key]: value }));

  const patchDetails = (patch: Partial<VehicleDetails>, recalc = true) => {
    setProfile((p) => {
      const nextDetails: VehicleDetails = {
        ...(p.vehicleDetails ?? EMPTY_VEHICLE_DETAILS),
        ...patch,
      };
      const next: UserProfile = { ...p, vehicleDetails: nextDetails };
      if (recalc && !nextDetails.costPerKmManual) {
        next.costPerKm = estimateCostPerKm(p.vehicle, nextDetails);
      }
      return next;
    });
  };

  const selectVehicle = (v: Vehicle) => {
    setProfile((p) => {
      const fuel = defaultFuelForVehicle(v);
      const nextDetails: VehicleDetails = {
        ...(p.vehicleDetails ?? EMPTY_VEHICLE_DETAILS),
        fuel,
        consumptionPer100Km:
          p.vehicleDetails?.consumptionPer100Km ??
          typicalConsumption(v, fuel),
        energyPrice:
          p.vehicleDetails?.energyPrice ??
          (fuel !== "aucun" ? DEFAULT_ENERGY_PRICE[fuel] : null),
        costPerKmManual: false,
      };
      return {
        ...p,
        vehicle: v,
        vehicleDetails: nextDetails,
        costPerKm: estimateCostPerKm(v, nextDetails),
      };
    });
  };

  const togglePlatform = (p: Platform) => {
    const current = profile.platforms ?? [];
    update(
      "platforms",
      current.includes(p)
        ? current.filter((x) => x !== p)
        : [...current, p],
    );
  };

  const onAvatarChange = (file: File | undefined) => {
    if (!file) return;
    const formData = new FormData();
    formData.set("avatar", file);
    setAvatarPending(true);
    startTransition(async () => {
      const result = await uploadAvatarAction(formData);
      setAvatarPending(false);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      if (result.data) {
        setProfile((p) => ({
          ...result.data!,
          vehicleDetails:
            result.data!.vehicleDetails ?? p.vehicleDetails ?? EMPTY_VEHICLE_DETAILS,
        }));
      }
      toast.success("Photo mise à jour");
    });
  };

  const onRemoveAvatar = () => {
    setAvatarPending(true);
    startTransition(async () => {
      const result = await removeAvatarAction();
      setAvatarPending(false);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      if (result.data) {
        setProfile((p) => ({
          ...result.data!,
          vehicleDetails:
            result.data!.vehicleDetails ?? p.vehicleDetails ?? EMPTY_VEHICLE_DETAILS,
        }));
      }
      toast.success("Photo retirée");
    });
  };

  const save = () => {
    if (!profile.firstName.trim()) {
      toast.error("Indique au moins ton prénom.");
      return;
    }
    if (profile.costPerKm < 0 || profile.targetHourly < 0 || profile.dailyTarget < 0) {
      toast.error("Les montants ne peuvent pas être négatifs.");
      return;
    }
    startTransition(async () => {
      const result = await updateProfileAction(profile);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      if (result.data) {
        setProfile((p) => ({
          ...result.data!,
          vehicleDetails:
            result.data!.vehicleDetails ?? p.vehicleDetails ?? EMPTY_VEHICLE_DETAILS,
        }));
      }
      trackMargeoEvent("margeo_profile_updated");
      toast.success("Profil enregistré", {
        description: "Pris en compte pour tes prochains verdicts.",
      });
    });
  };

  const initials = getProfileInitials(profile);
  const busy = pending || avatarPending;
  const estimated = estimateCostPerKm(profile.vehicle, details);
  const fuelOptions = Object.keys(VEHICLE_FUEL_LABELS) as VehicleFuel[];

  return (
    <div className="app-page mx-auto max-w-2xl space-y-5 pb-28 lg:pb-6">
      <header className="app-page-header">
        <p className="app-page-eyebrow">Profil</p>
        <h1 className="app-page-title">Ton compte</h1>
        <p className="app-page-desc">
          Photo, identité, véhicule et préférences pour des verdicts précis.
        </p>
      </header>

      <Card className="overflow-hidden">
        <CardContent className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:items-start">
          <div className="relative">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              className="group relative flex size-24 items-center justify-center overflow-hidden rounded-full border border-mg-border bg-mg-accent-soft text-2xl font-semibold text-mg-accent outline-none transition-transform focus-visible:ring-2 focus-visible:ring-mg-accent/40 active:scale-[0.98] disabled:opacity-60"
              aria-label="Changer la photo de profil"
            >
              {profile.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatarUrl}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                initials
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                <Camera className="size-5 text-white" />
              </span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(e) => {
                void onAvatarChange(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </div>
          <div className="w-full flex-1 space-y-3 text-center sm:text-left">
            <p className="text-sm font-medium text-mg-foreground">
              Photo de profil
            </p>
            <p className="text-xs text-mg-faint">
              JPG, PNG ou WebP · max 5 Mo.
            </p>
            {profile.avatarUrl ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={busy}
                onClick={onRemoveAvatar}
                className="mx-auto sm:mx-0"
              >
                Retirer la photo
              </Button>
            ) : null}
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Prénom">
                <Input
                  value={profile.firstName}
                  onChange={(e) => update("firstName", e.target.value)}
                  className="min-h-11"
                  autoComplete="given-name"
                  placeholder="Karim"
                />
              </Field>
              <Field label="Nom">
                <Input
                  value={profile.lastName}
                  onChange={(e) => update("lastName", e.target.value)}
                  className="min-h-11"
                  autoComplete="family-name"
                  placeholder="Benali"
                />
              </Field>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-mg-accent/20 bg-mg-accent-soft/10 p-5">
        <div className="flex items-center gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-mg-accent/25 bg-mg-accent-soft">
            <Target className="size-5 text-mg-accent" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-mg-foreground">
              Objectifs actuels
            </p>
            <p className="mt-1 text-sm text-mg-muted">
              <span className="font-semibold text-mg-foreground">
                {profile.targetHourly} €/h
              </span>{" "}
              ·{" "}
              <span className="font-semibold text-mg-foreground">
                {profile.dailyTarget} €
              </span>
              /jour
            </p>
            <p className="mt-0.5 text-xs text-mg-faint">
              {VEHICLE_LABELS[profile.vehicle]} · {profile.costPerKm} €/km
              {details.brand || details.model
                ? ` · ${[details.brand, details.model].filter(Boolean).join(" ")}`
                : ""}
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Préférences de base</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5">
          <Field label="Ville">
            <Input
              value={profile.city}
              onChange={(e) => update("city", e.target.value)}
              className="min-h-11"
              placeholder="Lyon"
            />
          </Field>

          <Field
            label="Type de véhicule"
            hint="Base du calcul de coût au kilomètre."
          >
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {VEHICLE_OPTIONS.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => selectVehicle(v)}
                  className={cn(
                    "flex min-h-[84px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border px-1.5 py-3 text-[11px] font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-mg-accent/40 sm:text-xs",
                    profile.vehicle === v
                      ? "border-mg-accent/50 bg-mg-accent-soft text-mg-accent shadow-mg-glow"
                      : "border-mg-border text-mg-muted hover:border-mg-border-strong hover:text-mg-foreground",
                  )}
                >
                  <VehicleIcon vehicle={v} selected={profile.vehicle === v} />
                  <span className="text-center leading-tight">
                    {VEHICLE_LABELS[v]}
                  </span>
                </button>
              ))}
            </div>
          </Field>

          <div className="rounded-xl border border-mg-border bg-[var(--mg-surface-muted)] p-4">
            <p className="text-sm font-semibold text-mg-foreground">
              Détails du véhicule
            </p>
            <p className="mt-1 text-xs text-mg-faint">
              Plus c&apos;est précis, plus le coût/km est réaliste.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Marque">
                <Input
                  value={details.brand}
                  onChange={(e) =>
                    patchDetails({ brand: e.target.value }, false)
                  }
                  className="min-h-11"
                  placeholder="Yamaha"
                  autoComplete="off"
                />
              </Field>
              <Field label="Modèle">
                <Input
                  value={details.model}
                  onChange={(e) =>
                    patchDetails({ model: e.target.value }, false)
                  }
                  className="min-h-11"
                  placeholder="NMAX 125"
                  autoComplete="off"
                />
              </Field>
              <Field label="Année" hint="Optionnel">
                <NumericInput
                  value={details.year}
                  decimals={0}
                  allowEmpty
                  placeholder="2022"
                  className="min-h-11"
                  onValueChange={(year) =>
                    patchDetails(
                      { year: year > 1900 ? year : null },
                      false,
                    )
                  }
                />
              </Field>
              <Field label="Énergie">
                <select
                  className="h-11 min-h-11 w-full rounded-xl border border-mg-border bg-[var(--mg-surface-muted)] px-3.5 text-sm text-mg-foreground outline-none focus:border-mg-accent/50 focus:ring-2 focus:ring-mg-accent/20"
                  value={details.fuel}
                  onChange={(e) => {
                    const fuel = e.target.value as VehicleFuel;
                    patchDetails({
                      fuel,
                      consumptionPer100Km:
                        details.consumptionPer100Km ??
                        typicalConsumption(profile.vehicle, fuel),
                      energyPrice:
                        details.energyPrice ??
                        (fuel !== "aucun" ? DEFAULT_ENERGY_PRICE[fuel] : null),
                      costPerKmManual: false,
                    });
                  }}
                >
                  {fuelOptions.map((f) => (
                    <option key={f} value={f}>
                      {VEHICLE_FUEL_LABELS[f]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field
                label={
                  details.fuel === "electrique"
                    ? "Conso (kWh/100 km)"
                    : "Conso (L/100 km)"
                }
              >
                <NumericInput
                  value={details.consumptionPer100Km}
                  decimals={1}
                  allowEmpty
                  className="min-h-11"
                  placeholder="3,5"
                  disabled={details.fuel === "aucun"}
                  onValueChange={(v) =>
                    patchDetails({
                      consumptionPer100Km: v > 0 ? v : null,
                      costPerKmManual: false,
                    })
                  }
                />
              </Field>
              <Field
                label={
                  details.fuel === "electrique" ? "Prix €/kWh" : "Prix €/L"
                }
              >
                <NumericInput
                  value={details.energyPrice}
                  decimals={2}
                  allowEmpty
                  className="min-h-11"
                  placeholder="1,85"
                  disabled={details.fuel === "aucun"}
                  onValueChange={(v) =>
                    patchDetails({
                      energyPrice: v > 0 ? v : null,
                      costPerKmManual: false,
                    })
                  }
                />
              </Field>
            </div>
            <p className="mt-3 text-xs text-mg-muted">
              Estimation calculée :{" "}
              <span className="font-semibold text-mg-foreground">
                {estimated.toFixed(3).replace(".", ",")} €/km
              </span>
              {details.costPerKmManual ? " · modifiée manuellement" : ""}
            </p>
          </div>

          <Field label="Plateformes">
            <div className="flex flex-wrap gap-2">
              {[...ONBOARDING_PLATFORMS, "Autre" as Platform].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePlatform(p)}
                  className={cn(
                    "inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-mg-accent/40",
                    profile.platforms?.includes(p)
                      ? "border-mg-accent/40 bg-mg-accent-soft text-mg-accent"
                      : "border-mg-border text-mg-muted hover:border-mg-border-strong",
                  )}
                >
                  <PlatformLogo platform={p} size="xs" />
                  {p}
                </button>
              ))}
            </div>
          </Field>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Field
              label="Coût / km"
              hint="Recalculé auto — tu peux corriger."
            >
              <NumericInput
                value={profile.costPerKm}
                decimals={3}
                className="min-h-11"
                onValueChange={(v) => {
                  setProfile((p) => ({
                    ...p,
                    costPerKm: v,
                    vehicleDetails: {
                      ...(p.vehicleDetails ?? EMPTY_VEHICLE_DETAILS),
                      costPerKmManual: true,
                    },
                  }));
                }}
              />
            </Field>
            <Field label="Objectif €/h">
              <NumericInput
                value={profile.targetHourly}
                decimals={0}
                className="min-h-11"
                onValueChange={(v) => update("targetHourly", v)}
              />
            </Field>
            <Field label="Objectif / jour">
              <NumericInput
                value={profile.dailyTarget}
                decimals={0}
                className="min-h-11"
                onValueChange={(v) => update("dailyTarget", v)}
              />
            </Field>
            <Field label="Bénéfice min. (€)">
              <NumericInput
                value={profile.minBenefit ?? 6}
                decimals={1}
                className="min-h-11"
                onValueChange={(v) => update("minBenefit", v)}
              />
            </Field>
            <Field label="Distance max. (km)">
              <NumericInput
                value={profile.maxDistanceKm ?? 8}
                decimals={0}
                className="min-h-11"
                onValueChange={(v) => update("maxDistanceKm", v)}
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Apparence & compte</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-mg-accent-soft">
                {theme === "dark" ? (
                  <Moon className="size-4 text-mg-accent" />
                ) : (
                  <Sun className="size-4 text-mg-accent" />
                )}
              </span>
              <div>
                <p className="text-sm font-medium text-mg-foreground">
                  Mode clair
                </p>
                <p className="text-xs text-mg-faint">
                  {theme === "light"
                    ? "Thème clair actif"
                    : "Thème sombre (route de nuit)"}
                </p>
              </div>
            </div>
            <Switch
              checked={theme === "light"}
              onCheckedChange={(checked) =>
                setTheme(checked ? "light" : "dark")
              }
              aria-label="Activer le mode clair"
            />
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-mg-accent/25 bg-gradient-to-br from-mg-accent-soft/40 to-transparent p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-mg-accent-soft">
                <Crown className="size-5 text-mg-accent" />
              </span>
              <div>
                <p className="text-sm font-semibold text-mg-foreground">
                  {profile.planId === "elite"
                    ? "Compte Elite"
                    : profile.premium || profile.planId === "pro"
                      ? "Compte Pro"
                      : `Plan ${DRIVEELY_PLANS.discovery.name}`}
                </p>
                <p className="text-xs text-mg-muted">
                  {profile.premium ||
                  profile.planId === "pro" ||
                  profile.planId === "elite"
                    ? "Analyses illimitées."
                    : `${DRIVEELY_LIMITS.freeDailyAnalyses} analyses/jour — passe en Pro pour lever la limite.`}
                </p>
              </div>
            </div>
            <Link
              href={
                profile.premium ||
                profile.planId === "pro" ||
                profile.planId === "elite"
                  ? margeoRoutes.subscription
                  : `${margeoRoutes.premium}?source=nav`
              }
            >
              <Button
                variant="secondary"
                size="sm"
                className="min-h-10 w-full sm:w-auto"
              >
                {profile.premium ||
                profile.planId === "pro" ||
                profile.planId === "elite"
                  ? "Gérer l'abonnement"
                  : "Débloquer mon plan →"}
              </Button>
            </Link>
          </div>

          <Link
            href={margeoRoutes.beta}
            className="flex items-center gap-3 rounded-xl border border-mg-border bg-[var(--mg-surface-muted)] p-4 transition-colors hover:border-mg-accent/30 hover:bg-mg-accent-soft/20"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-mg-border bg-mg-card">
              <FlaskConical className="size-5 text-mg-accent" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-mg-foreground">
                Programme Bêta
              </span>
              <span className="block text-xs text-mg-muted">
                Mission, retours, tarif préférentiel · Beta 0.1
              </span>
            </span>
            <span className="text-xs font-medium text-mg-accent">Voir →</span>
          </Link>

          <a
            href={DRIVEELY_PATHS.deconnexion}
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-mg-stop/30 bg-mg-stop-soft px-4 text-sm font-medium text-mg-stop transition-colors hover:border-mg-stop/50"
          >
            <LogOut className="size-4" />
            Se déconnecter
          </a>

          <PersonalDataSection />
        </CardContent>
      </Card>

      <div className="hidden justify-end gap-3 lg:flex">
        <Button onClick={save} disabled={busy} className="min-h-11">
          <Save />
          {pending ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </div>

      <div className="fixed inset-x-0 bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] z-20 border-t border-mg-border bg-mg-background/92 p-3 backdrop-blur-xl lg:hidden">
        <Button
          onClick={save}
          disabled={busy}
          className="app-cta-primary w-full min-h-12"
        >
          <Save />
          {pending ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </div>
    </div>
  );
}
