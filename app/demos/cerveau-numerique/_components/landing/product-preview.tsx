"use client";

import { motion } from "framer-motion";
import {
  Home,
  Mail,
  CheckSquare,
  Calendar,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { Eyebrow } from "../ui/eyebrow";

const railIcons = [Home, Mail, CheckSquare, Calendar, FileText];

const categories = [
  { label: "Factures", tint: "#4f9eff" },
  { label: "Contrats", tint: "#34d399" },
  { label: "Santé", tint: "#f472b6" },
  { label: "Logement", tint: "#fbbf24" },
];

const tasks = [
  { label: "Renouveler l'assurance auto", done: true },
  { label: "Payer la facture EDF", done: true },
  { label: "Relancer le propriétaire", done: false },
];

export function ProductPreview() {
  return (
    <section id="produit" className="relative px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <Eyebrow pulse={false}>Aperçu du produit</Eyebrow>
          <h2 className="mx-auto mt-4 max-w-lg text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
            Tout, déjà rangé.
          </h2>
        </motion.div>

        <motion.div
          className="cn-mock-window relative mt-14 overflow-hidden"
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Browser chrome */}
          <div className="flex items-center gap-2 border-b border-[var(--cn-border-soft)] px-4 py-3">
            <span className="size-2.5 rounded-full bg-white/15" />
            <span className="size-2.5 rounded-full bg-white/15" />
            <span className="size-2.5 rounded-full bg-white/15" />
            <span className="cn-mono ml-3 text-[11px] text-[var(--cn-ghost)]">
              moncerveaunumerique.app
            </span>
          </div>

          <div className="flex">
            {/* Icon rail */}
            <div className="hidden flex-col items-center gap-4 border-r border-[var(--cn-border-soft)] px-4 py-6 sm:flex">
              {railIcons.map((Icon, i) => (
                <span
                  key={i}
                  className={
                    i === 0
                      ? "flex size-8 items-center justify-center rounded-lg bg-[var(--cn-primary-tint)] text-[var(--cn-primary)]"
                      : "flex size-8 items-center justify-center rounded-lg text-[var(--cn-ghost)]"
                  }
                >
                  <Icon className="size-4" />
                </span>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 p-6 sm:p-8">
              <p className="text-sm text-[var(--cn-faint)]">
                Vendredi 3 juillet
              </p>
              <h3 className="mt-1 text-xl font-semibold">Bonjour Alex 👋</h3>

              <p className="mt-6 text-xs font-medium uppercase tracking-[0.1em] text-[var(--cn-ghost)]">
                Documents classés automatiquement
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {categories.map((c) => (
                  <span
                    key={c.label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[var(--cn-border)] bg-white/[0.03] px-3 py-1.5 text-xs text-[var(--cn-muted)]"
                  >
                    <span
                      className="size-1.5 rounded-full"
                      style={{ backgroundColor: c.tint }}
                    />
                    {c.label}
                  </span>
                ))}
              </div>

              <p className="mt-6 text-xs font-medium uppercase tracking-[0.1em] text-[var(--cn-ghost)]">
                Tâches priorisées
              </p>
              <div className="mt-3 space-y-2">
                {tasks.map((t) => (
                  <div
                    key={t.label}
                    className="flex items-center gap-2.5 rounded-lg border border-[var(--cn-border-soft)] bg-white/[0.02] px-3 py-2.5 text-sm"
                  >
                    <CheckCircle2
                      className="size-4 shrink-0"
                      style={{
                        color: t.done ? "#34d399" : "var(--cn-ghost)",
                      }}
                    />
                    <span
                      className={
                        t.done
                          ? "text-[var(--cn-faint)] line-through"
                          : "text-[var(--cn-fg)]"
                      }
                    >
                      {t.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
