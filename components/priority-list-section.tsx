"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { useState } from "react";
import { CinematicReveal } from "@/components/motion/cinematic-reveal";
import { PriorityListHero } from "@/components/priority-list-hero";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  priorityListConfirmation,
  priorityListReassurance,
  submitPriorityList,
  type PriorityListSubmission,
} from "@/lib/priority-list";

type FormState = "idle" | "submitting" | "success" | "error";

const initialForm: PriorityListSubmission = {
  name: "",
  email: "",
  company: "",
  website: "",
  need: "",
};

export function PriorityListSection() {
  const [form, setForm] = useState(initialForm);
  const [state, setState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  function updateField(field: keyof PriorityListSubmission, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");
    setErrorMessage("");

    try {
      await submitPriorityList({
        ...form,
        website: form.website?.trim() || undefined,
      });
      setState("success");
      setForm(initialForm);
    } catch (error) {
      setState("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue. Réessayez dans un instant.",
      );
    }
  }

  return (
    <section id="contact" className="space-y-7 pb-6 max-md:space-y-6 md:max-lg:space-y-8 lg:space-y-8">
      <PriorityListHero />

      <CinematicReveal delay={0.06}>
        <div className="priority-list-card mx-auto max-w-2xl rounded-3xl p-5 max-md:p-5 md:p-9">
          <AnimatePresence mode="wait">
            {state === "success" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="priority-list-success flex flex-col items-center gap-4 py-8 text-center"
              >
                <div className="flex size-12 items-center justify-center rounded-full border border-[var(--ring)] bg-[var(--accent-soft)]">
                  <Check className="size-5 text-[var(--accent)]" aria-hidden />
                </div>
                <p className="max-w-md text-base leading-8 text-[var(--foreground)]/95 md:text-lg">
                  {priorityListConfirmation}
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 text-left">
                    <span className="text-xs font-medium uppercase tracking-[0.06em] text-[var(--muted)]">
                      Nom
                    </span>
                    <Input
                      name="name"
                      placeholder="Jean Dupont"
                      value={form.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      required
                      autoComplete="name"
                    />
                  </label>
                  <label className="space-y-2 text-left">
                    <span className="text-xs font-medium uppercase tracking-[0.06em] text-[var(--muted)]">
                      Email professionnel
                    </span>
                    <Input
                      name="email"
                      type="email"
                      placeholder="contact@votre-entreprise.fr"
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </label>
                </div>

                <label className="block space-y-2 text-left">
                  <span className="text-xs font-medium uppercase tracking-[0.06em] text-[var(--muted)]">
                    Entreprise
                  </span>
                  <Input
                    name="company"
                    placeholder="Nom de votre entreprise"
                    value={form.company}
                    onChange={(e) => updateField("company", e.target.value)}
                    required
                    autoComplete="organization"
                  />
                </label>

                <label className="block space-y-2 text-left">
                  <span className="text-xs font-medium uppercase tracking-[0.06em] text-[var(--muted)]">
                    Site web actuel{" "}
                    <span className="normal-case tracking-normal text-[var(--muted)]/80">
                      (optionnel)
                    </span>
                  </span>
                  <Input
                    name="website"
                    type="url"
                    placeholder="https://votre-site.fr"
                    value={form.website}
                    onChange={(e) => updateField("website", e.target.value)}
                    autoComplete="url"
                  />
                </label>

                <label className="block space-y-2 text-left">
                  <span className="text-xs font-medium uppercase tracking-[0.06em] text-[var(--muted)]">
                    Besoin principal
                  </span>
                  <Textarea
                    name="need"
                    placeholder="Refonte de site, création vitrine, optimisation conversion…"
                    value={form.need}
                    onChange={(e) => updateField("need", e.target.value)}
                    required
                    className="min-h-32"
                  />
                </label>

                {state === "error" && errorMessage ? (
                  <p className="rounded-xl border border-red-400/30 bg-red-400/8 px-4 py-3 text-sm text-red-300">
                    {errorMessage}
                  </p>
                ) : null}

                <MagneticButton
                  type="submit"
                  size="lg"
                  className="hero-cta-primary group w-full touch-target sm:w-auto"
                  disabled={state === "submitting"}
                >
                  {state === "submitting" ? "Envoi en cours…" : "Rejoindre la liste prioritaire"}
                  <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </MagneticButton>
              </motion.form>
            )}
          </AnimatePresence>

          {state !== "success" ? (
            <ul className="priority-list-reassurance mt-7 grid gap-3 border-t border-[var(--border)] pt-6 max-md:grid-cols-1 sm:grid-cols-3">
              {priorityListReassurance.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-xs leading-6 text-[var(--muted)] sm:text-sm"
                >
                  <Check className="mt-0.5 size-3.5 shrink-0 text-[var(--accent)]" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </CinematicReveal>

      <CinematicReveal delay={0.1} className="flex justify-center">
        <p className="inline-flex items-center gap-2 text-xs text-[var(--muted)]">
          <Sparkles className="size-3.5 text-[var(--accent)]" aria-hidden />
          Nocta Agency · Lancement en préparation
        </p>
      </CinematicReveal>
    </section>
  );
}
