"use client";

import { useState } from "react";
import { CONTACT_SUBJECTS, PALAN_BASE } from "@/lib/palan-capital/constants";

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
      <div className="border border-[var(--line-gold)] bg-[var(--white)] p-10">
        <p className="font-serif text-2xl text-[var(--navy)]">Demande envoyée</p>
        <p className="pc-body mt-4">
          Nous reviendrons vers vous dans les meilleurs délais. Entretien confidentiel, sans engagement.
        </p>
        <button
          type="button"
          className="mt-8 text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--gold)]"
          onClick={() => setState("idle")}
        >
          Nouvelle demande
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="pc-field">
        <label htmlFor="nom">Nom & prénom</label>
        <input id="nom" name="nom" required className="pc-input" placeholder="Jean Dupont" />
      </div>

      <div className="pc-field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required className="pc-input" placeholder="jean@exemple.fr" />
      </div>

      <div className="pc-field">
        <label htmlFor="societe">Société</label>
        <input id="societe" name="societe" className="pc-input" placeholder="Nom de votre société" />
      </div>

      <div className="pc-field">
        <label htmlFor="sujet">Objet de la demande</label>
        <select id="sujet" name="sujet" className="pc-input pc-select" defaultValue="">
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

      <div className="pc-field">
        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          name="message"
          rows={4}
          className="pc-input min-h-[6rem] resize-y"
          placeholder="Votre message…"
        />
      </div>

      <label className="mb-8 flex items-start gap-3 text-[0.8125rem] leading-relaxed text-[var(--gray)]">
        <input type="checkbox" name="rgpd" required className="mt-1 accent-[var(--gold)]" />
        <span>
          J&apos;accepte que mes données soient utilisées pour répondre à ma demande, conformément à la{" "}
          <a href={`${PALAN_BASE}/mentions-legales#confidentialite`} className="text-[var(--gold)] underline">
            politique de confidentialité
          </a>
          .
        </span>
      </label>

      {state === "error" && (
        <p className="mb-4 text-sm text-red-800" role="alert">
          {error}
        </p>
      )}

      <button type="submit" disabled={state === "loading"} className="pc-btn pc-btn-gold w-full sm:w-auto">
        {state === "loading" ? "Envoi…" : "Envoyer la demande"}
      </button>
    </form>
  );
}
