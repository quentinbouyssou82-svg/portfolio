"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Info } from "lucide-react";
import {
  TASK_CATEGORIES,
  RECURRENCE_OPTIONS,
  PRIORITY_LEGEND,
} from "../../_lib/dashboard-data";

export function TaskModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-md rounded-[var(--cn-radius)] border border-[var(--cn-border)] bg-[var(--cn-bg-elev)] p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="inline-flex items-center gap-2 text-base font-semibold">
                <Plus className="size-4 text-[var(--cn-primary)]" />
                Nouvelle tâche
              </h3>
              <button
                onClick={onClose}
                aria-label="Fermer"
                className="text-[var(--cn-faint)] transition-colors hover:text-[var(--cn-fg)]"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <Field label="Titre *">
                <input
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Payer la facture EDF"
                  className={inputCls}
                />
              </Field>

              <Field label="Description (optionnel)">
                <textarea
                  rows={2}
                  placeholder="Contexte, informations utiles..."
                  className={`${inputCls} resize-none`}
                />
              </Field>

              <Field label="Échéance">
                <input type="date" className={inputCls} />
              </Field>

              <div className="rounded-lg border border-[var(--cn-border-soft)] bg-white/[0.03] p-3">
                <p className="flex items-start gap-1.5 text-xs text-[var(--cn-muted)]">
                  <Info className="mt-0.5 size-3.5 shrink-0 text-[var(--cn-primary)]" />
                  La priorité est calculée automatiquement selon la date
                  d&apos;échéance :
                </p>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 pl-5 text-xs text-[var(--cn-muted)]">
                  {PRIORITY_LEGEND.map((p) => (
                    <span key={p.label} className="inline-flex items-center gap-1">
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: p.dot }}
                      />
                      {p.label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Catégorie">
                  <select className={inputCls} defaultValue="">
                    <option value="">— Aucune —</option>
                    {TASK_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Récurrence">
                  <select className={inputCls} defaultValue="none">
                    {RECURRENCE_OPTIONS.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={onClose}
                className="rounded-lg border border-[var(--cn-border)] py-2.5 text-sm font-medium text-[var(--cn-fg)] transition-colors hover:bg-white/[0.05]"
              >
                Annuler
              </button>
              <button
                disabled={!title.trim()}
                onClick={onClose}
                className="rounded-lg bg-[image:var(--cn-grad-primary)] py-2.5 text-sm font-semibold text-white shadow-[var(--cn-glow)] transition-all hover:brightness-110 disabled:opacity-40 disabled:shadow-none"
              >
                Créer
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const inputCls =
  "w-full rounded-lg border border-[var(--cn-border)] bg-[var(--cn-surface)] px-3 py-2.5 text-sm text-[var(--cn-fg)] placeholder:text-[var(--cn-faint)] focus:border-[var(--cn-primary-border)]";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-[var(--cn-muted)]">
        {label}
      </label>
      {children}
    </div>
  );
}
