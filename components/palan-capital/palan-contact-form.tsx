"use client";

import { useState } from "react";
import { CONTACT_SUBJECTS } from "@/lib/palan-capital/constants";

type FormState = "idle" | "loading" | "success" | "error";

export function PalanContactForm() {
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    setError("");

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch("/api/palan-capital/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? "Une erreur est survenue.");
      }

      setState("success");
      form.reset();
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    }
  }

  if (state === "success") {
    return (
      <div className="rounded-sm border border-[var(--palan-line)] bg-white/50 p-8">
        <p className="font-display text-xl text-[var(--palan-navy)]">Demande envoyée.</p>
        <p className="mt-3 text-[0.875rem] leading-relaxed text-[var(--palan-gray)]">
          Nous reviendrons vers vous dans les meilleurs délais. Entretien confidentiel, sans engagement.
        </p>
        <button
          type="button"
          className="mt-6 text-[0.68rem] uppercase tracking-[0.12em] text-[var(--palan-gold)]"
          onClick={() => setState("idle")}
        >
          Envoyer une autre demande
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      <div>
        <label htmlFor="nom" className="mb-2 block text-[0.62rem] uppercase tracking-[0.14em] text-[var(--palan-gray)]">
          Nom & prénom
        </label>
        <input id="nom" name="nom" required className="palan-input" placeholder="Jean Dupont" />
      </div>

      <div>
        <label htmlFor="email" className="mb-2 block text-[0.62rem] uppercase tracking-[0.14em] text-[var(--palan-gray)]">
          Email
        </label>
        <input id="email" name="email" type="email" required className="palan-input" placeholder="jean@exemple.fr" />
      </div>

      <div>
        <label htmlFor="societe" className="mb-2 block text-[0.62rem] uppercase tracking-[0.14em] text-[var(--palan-gray)]">
          Société
        </label>
        <input id="societe" name="societe" className="palan-input" placeholder="Nom de votre société" />
      </div>

      <div>
        <label htmlFor="sujet" className="mb-2 block text-[0.62rem] uppercase tracking-[0.14em] text-[var(--palan-gray)]">
          Objet de la demande
        </label>
        <select id="sujet" name="sujet" className="palan-input palan-select" defaultValue="">
          <option value="" disabled>
            Sélectionner…
          </option>
          {CONTACT_SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="message" className="mb-2 block text-[0.62rem] uppercase tracking-[0.14em] text-[var(--palan-gray)]">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          className="palan-input min-h-[100px] resize-y"
          placeholder="Décrivez brièvement votre situation ou votre question…"
        />
      </div>

      <label className="flex items-start gap-3 text-[0.75rem] leading-relaxed text-[var(--palan-gray)]">
        <input type="checkbox" name="rgpd" required className="mt-1" />
        <span>
          J&apos;accepte que mes données soient utilisées pour répondre à ma demande, conformément à la{" "}
          <a href="/demos/palan-capital/mentions-legales#confidentialite" className="text-[var(--palan-gold)] underline">
            politique de confidentialité
          </a>
          .
        </span>
      </label>

      {state === "error" && (
        <p className="text-[0.8rem] text-red-700" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={state === "loading"}
        className="w-full bg-[var(--palan-gold)] px-8 py-3 text-[0.68rem] font-medium uppercase tracking-[0.13em] text-white transition-opacity hover:opacity-85 disabled:opacity-60"
      >
        {state === "loading" ? "Envoi…" : "Envoyer la demande"}
      </button>
    </form>
  );
}
