"use client";

import { ArrowRight, Check } from "lucide-react";
import { useRef, useState } from "react";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { Input } from "@/components/ui/input";
import { submitWaitlist, waitlistSuccessMessage } from "@/lib/waitlist";
import { cn } from "@/lib/utils";

type WaitlistState = "idle" | "loading" | "success" | "error";

export function WaitlistEmailForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<WaitlistState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const submittingRef = useRef(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submittingRef.current || state === "loading") return;

    submittingRef.current = true;
    setState("loading");
    setErrorMessage("");

    try {
      await submitWaitlist(email);
      setState("success");
      setEmail("");
    } catch (error) {
      setState("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue. Réessayez dans un instant.",
      );
    } finally {
      submittingRef.current = false;
    }
  }

  if (state === "success") {
    return (
      <div
        className="waitlist-feedback flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"
        role="status"
      >
        <Check className="size-4 shrink-0 text-emerald-400" aria-hidden />
        <p>{waitlistSuccessMessage}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--muted)]">
        Inscription rapide · Waitlist
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <label className="sr-only" htmlFor="waitlist-email">
          Email
        </label>
        <Input
          id="waitlist-email"
          name="email"
          type="email"
          placeholder="votre@email.fr"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (state === "error") setState("idle");
          }}
          required
          autoComplete="email"
          disabled={state === "loading"}
          className="min-h-11 flex-1"
        />
        <MagneticButton
          type="submit"
          size="lg"
          className="hero-cta-primary shrink-0 touch-target sm:min-w-[10.5rem]"
          disabled={state === "loading"}
        >
          {state === "loading" ? "Envoi…" : "Rejoindre la waitlist"}
          <ArrowRight className="size-4" />
        </MagneticButton>
      </div>

      {state === "error" && errorMessage ? (
        <p
          className={cn(
            "waitlist-feedback rounded-xl border border-red-400/30 bg-red-400/8 px-4 py-3 text-sm text-red-300",
          )}
          role="alert"
        >
          {errorMessage}
        </p>
      ) : null}
    </form>
  );
}
