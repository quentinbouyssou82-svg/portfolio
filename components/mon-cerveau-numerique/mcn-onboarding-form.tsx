"use client";

import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { McnLogo } from "@/components/mon-cerveau-numerique/mcn-logo";
import { McnButton } from "@/components/mon-cerveau-numerique/ui/button";
import { McnCard, McnCardContent } from "@/components/mon-cerveau-numerique/ui/card";
import { McnInput } from "@/components/mon-cerveau-numerique/ui/input";
import { McnLabel } from "@/components/mon-cerveau-numerique/ui/label";
import { useMcnStore } from "@/hooks/use-mcn-store";
import { MCN_PATHS } from "@/lib/mon-cerveau-numerique/constants";
import { onboardingSteps } from "@/lib/mon-cerveau-numerique/content";
import { cn } from "@/lib/utils";

const priorityOptions = [
  { id: "documents", label: "Mes documents" },
  { id: "todos", label: "Mes tâches" },
  { id: "emails", label: "Mes emails" },
  { id: "economies", label: "Économiser" },
] as const;

export function McnOnboardingForm() {
  const router = useRouter();
  const { updateProfile } = useMcnStore();
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState("");
  const [priorities, setPriorities] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  function togglePriority(id: string) {
    setPriorities((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  }

  function handleNext() {
    if (step === 0 && !displayName.trim()) {
      setMessage("Indique ton prénom ou pseudo.");
      return;
    }
    setMessage(null);
    setStep((s) => Math.min(s + 1, onboardingSteps.length - 1));
  }

  function handleFinish() {
    updateProfile({
      display_name: displayName.trim(),
      priorities,
      onboarding_completed: true,
    });
    router.push(MCN_PATHS.dashboard);
  }

  const current = onboardingSteps[step];

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-16 sm:py-20">
      <McnCard className="mcn-animate-in">
        <McnCardContent className="p-6 sm:p-8">
          <div className="mb-6 flex flex-col items-center">
            <McnLogo size={18} className="mb-4" />
            <div className="flex w-full max-w-xs gap-1.5">
              {onboardingSteps.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors duration-300",
                    i <= step ? "bg-[var(--mcn-accent)]" : "bg-[var(--mcn-surface-hover)]",
                  )}
                />
              ))}
            </div>
          </div>

          <div className="mb-6 text-center">
            <h2 className="text-lg font-semibold tracking-tight">{current.title}</h2>
            <p className="mt-1 text-sm text-[var(--mcn-fg-muted)]">{current.description}</p>
          </div>

          {step === 0 ? (
            <div className="space-y-2">
              <McnLabel htmlFor="mcn-name">Ton prénom</McnLabel>
              <McnInput
                id="mcn-name"
                placeholder="Alex"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
          ) : null}

          {step === 1 ? (
            <div className="grid grid-cols-2 gap-2">
              {priorityOptions.map((opt) => {
                const selected = priorities.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => togglePriority(opt.id)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border p-3 text-left text-sm transition-all duration-200",
                      selected
                        ? "border-[var(--mcn-accent)]/40 bg-[var(--mcn-accent)]/10 text-[var(--mcn-fg)]"
                        : "border-[var(--mcn-border)] bg-[var(--mcn-surface)] text-[var(--mcn-fg-muted)] hover:border-[var(--mcn-border-strong)] hover:bg-[var(--mcn-surface-hover)]",
                    )}
                  >
                    {selected ? (
                      <Check className="size-3.5 shrink-0 text-[var(--mcn-accent)]" />
                    ) : (
                      <span className="size-3.5 shrink-0 rounded-full border border-[var(--mcn-border)]" />
                    )}
                    {opt.label}
                  </button>
                );
              })}
            </div>
          ) : null}

          {step === 2 ? (
            <div className="rounded-lg border border-[var(--mcn-border)] bg-[var(--mcn-surface)] p-4 text-center text-sm text-[var(--mcn-fg-muted)]">
              Salut <span className="font-medium text-[var(--mcn-fg)]">{displayName}</span> !
              Ton espace est configuré. On commence par tes documents et tâches.
            </div>
          ) : null}

          {message ? (
            <p className="mt-4 text-center text-sm text-red-400">{message}</p>
          ) : null}

          <div className="mt-8 space-y-3">
            {step < onboardingSteps.length - 1 ? (
              <McnButton type="button" onClick={handleNext} className="w-full" size="lg">
                Continuer
                <ArrowRight className="size-4" />
              </McnButton>
            ) : (
              <McnButton type="button" onClick={handleFinish} className="w-full" size="lg">
                Accéder au dashboard
              </McnButton>
            )}
            <Link
              href={MCN_PATHS.dashboard}
              className="block text-center text-xs text-[var(--mcn-fg-subtle)] transition-colors hover:text-[var(--mcn-fg-muted)]"
            >
              Passer l&apos;onboarding →
            </Link>
          </div>
        </McnCardContent>
      </McnCard>
    </div>
  );
}
