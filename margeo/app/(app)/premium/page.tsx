"use client";

import { Check, Crown, Minus, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PlanFeature {
  label: string;
  free: string | boolean;
  premium: string | boolean;
}

const FEATURES: PlanFeature[] = [
  { label: "Analyses de courses", free: "5 / jour", premium: "Illimitées" },
  { label: "Score de rentabilité", free: true, premium: true },
  { label: "Recommandation IA", free: true, premium: true },
  { label: "Historique", free: "7 jours", premium: "Illimité" },
  { label: "Statistiques avancées", free: false, premium: true },
  { label: "Multi-plateformes simultané", free: false, premium: true },
  { label: "Recommandations de zones", free: false, premium: true },
  { label: "Export comptable (CSV)", free: false, premium: true },
  { label: "Support prioritaire", free: false, premium: true },
];

function FeatureValue({ value }: { value: string | boolean }) {
  if (value === true) return <Check className="mx-auto size-4 text-accent" />;
  if (value === false) return <Minus className="mx-auto size-4 text-faint/50" />;
  return <span className="text-sm text-foreground">{value}</span>;
}

export default function PremiumPage() {
  const [starting, setStarting] = useState(false);

  const startTrial = () => {
    setStarting(true);
    setTimeout(() => {
      setStarting(false);
      toast.success("Essai Premium activé 🎉", {
        description:
          "14 jours d'analyses illimitées. Aucun prélèvement avant la fin de l'essai.",
      });
    }, 1200);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      {/* En-tête */}
      <Reveal className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent-soft px-3.5 py-1.5 text-xs font-medium text-accent">
          <Crown className="size-3.5" />
          Margeo Premium
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground">
          Chaque course refusée au bon moment{" "}
          <span className="text-gradient-accent">te rapporte</span>.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-muted">
          Nos livreurs Premium récupèrent en moyenne 214 € de gain net par mois.
          L&apos;abonnement se rembourse en deux soirées.
        </p>
      </Reveal>

      {/* Cartes de prix */}
      <div className="grid gap-5 sm:grid-cols-2">
        <Reveal>
          <Card className="flex h-full flex-col p-6">
            <p className="font-semibold text-foreground">Gratuit</p>
            <p className="mt-1 text-sm text-muted">
              Pour tester Margeo sur tes premières courses.
            </p>
            <p className="mt-5 text-4xl font-bold tracking-tight text-foreground">
              0 €
              <span className="text-base font-normal text-faint"> / mois</span>
            </p>
            <ul className="mt-6 flex-1 space-y-2.5 text-sm text-muted">
              <li className="flex gap-2.5">
                <Check className="mt-0.5 size-4 shrink-0 text-muted" />5 analyses
                par jour
              </li>
              <li className="flex gap-2.5">
                <Check className="mt-0.5 size-4 shrink-0 text-muted" />
                Score et recommandation IA
              </li>
              <li className="flex gap-2.5">
                <Check className="mt-0.5 size-4 shrink-0 text-muted" />
                Historique 7 jours
              </li>
            </ul>
            <Button variant="secondary" className="mt-6 w-full" disabled>
              Ton plan actuel
            </Button>
          </Card>
        </Reveal>

        <Reveal delay={0.1}>
          <Card className="relative flex h-full flex-col border-accent/40 p-6 shadow-glow">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent-strong px-3 py-1 text-xs font-bold text-[#04120c]">
              Recommandé
            </span>
            <p className="flex items-center gap-2 font-semibold text-foreground">
              Premium
              <Zap className="size-4 text-accent" />
            </p>
            <p className="mt-1 text-sm text-muted">
              Pour ceux qui livrent tous les jours.
            </p>
            <p className="mt-5 text-4xl font-bold tracking-tight text-foreground">
              6,99 €
              <span className="text-base font-normal text-faint"> / mois</span>
            </p>
            <ul className="mt-6 flex-1 space-y-2.5 text-sm text-foreground/90">
              <li className="flex gap-2.5">
                <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                Analyses illimitées
              </li>
              <li className="flex gap-2.5">
                <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                Statistiques et zones rentables
              </li>
              <li className="flex gap-2.5">
                <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                Historique illimité + export CSV
              </li>
              <li className="flex gap-2.5">
                <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                Support prioritaire
              </li>
            </ul>
            <Button
              className="mt-6 w-full"
              onClick={startTrial}
              disabled={starting}
            >
              {starting ? "Activation…" : "Commencer l'essai — 14 jours offerts"}
            </Button>
            <p className="mt-2.5 text-center text-xs text-faint">
              Sans engagement. Annulable en un clic.
            </p>
          </Card>
        </Reveal>
      </div>

      {/* Tableau comparatif */}
      <Reveal delay={0.15}>
        <Card className="overflow-hidden">
          <div className="grid grid-cols-[1.6fr_1fr_1fr] border-b border-border bg-white/[0.02] px-5 py-3.5 text-xs font-semibold tracking-wide text-muted uppercase">
            <span>Fonctionnalité</span>
            <span className="text-center">Gratuit</span>
            <span className="text-center text-accent">Premium</span>
          </div>
          {FEATURES.map((feature, i) => (
            <div
              key={feature.label}
              className={cn(
                "grid grid-cols-[1.6fr_1fr_1fr] items-center px-5 py-3.5 text-center transition-colors hover:bg-white/[0.02]",
                i < FEATURES.length - 1 && "border-b border-border"
              )}
            >
              <span className="text-left text-sm text-foreground">
                {feature.label}
              </span>
              <FeatureValue value={feature.free} />
              <FeatureValue value={feature.premium} />
            </div>
          ))}
        </Card>
      </Reveal>
    </div>
  );
}
