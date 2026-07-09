"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, type Variants } from "framer-motion";
import { CheckCircle2, Circle } from "lucide-react";

const GREETING = "Bonjour Alex 👋";

const categories = [
  { label: "Factures", tint: "#4f9eff" },
  { label: "Contrats", tint: "#34d399" },
  { label: "Santé", tint: "#f472b6" },
  { label: "Logement", tint: "#fbbf24" },
];

const taskDefs = [
  { label: "Renouveler l'assurance auto", autoComplete: true },
  { label: "Payer la facture EDF", autoComplete: true },
  { label: "Relancer le propriétaire", autoComplete: false },
];

const groupVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.11, delayChildren: 0.08 } },
};

const chipVariants: Variants = {
  hidden: { opacity: 0, scale: 0.85, y: 6 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

const rowVariants: Variants = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

export function LiveAppPreview() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  const [typed, setTyped] = useState("");
  const [showDocs, setShowDocs] = useState(false);
  const [showTasks, setShowTasks] = useState(false);
  const [checked, setChecked] = useState<boolean[]>(() => taskDefs.map(() => false));

  const dateLabel = useRef(
    (() => {
      const raw = new Intl.DateTimeFormat("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }).format(new Date());
      return raw.charAt(0).toUpperCase() + raw.slice(1);
    })(),
  ).current;

  // Typewriter — starts once the card enters the viewport.
  useEffect(() => {
    if (!inView) return;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setTyped(GREETING.slice(0, i));
      if (i >= GREETING.length) clearInterval(id);
    }, 45);
    return () => clearInterval(id);
  }, [inView]);

  // Sequenced reveal: greeting → categories → tasks.
  useEffect(() => {
    if (!inView) return;
    const t1 = setTimeout(() => setShowDocs(true), GREETING.length * 45 + 300);
    const t2 = setTimeout(() => setShowTasks(true), GREETING.length * 45 + 300 + 950);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [inView]);

  // Auto-classification: tasks tick themselves off, live, one after another.
  useEffect(() => {
    if (!showTasks) return;
    const timers = taskDefs.map((task, i) => {
      if (!task.autoComplete) return undefined;
      return setTimeout(() => {
        setChecked((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, 550 + i * 600);
    });
    return () => timers.forEach((t) => t && clearTimeout(t));
  }, [showTasks]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28, scale: 0.97 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-md sm:max-w-lg"
    >
      {/* Ambient breathing glow so the card reads as an active, live system. */}
      <motion.div
        aria-hidden
        className="absolute -inset-3 -z-10 rounded-[calc(var(--cn-radius-lg)+12px)]"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 30%, rgba(79,158,255,0.16), transparent 75%)",
          filter: "blur(20px)",
        }}
        animate={{ opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      />

      <div id="produit" className="cn-mock-window relative scroll-mt-28 overflow-hidden text-left">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 border-b border-[var(--cn-border-soft)] px-4 py-2.5">
          <span className="size-2 rounded-full bg-white/15" />
          <span className="size-2 rounded-full bg-white/15" />
          <span className="size-2 rounded-full bg-white/15" />
          <span className="cn-mono ml-2 inline-flex items-center gap-1.5 text-[10px] text-[var(--cn-ghost)]">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#34d399] opacity-60" />
              <span className="relative inline-flex size-1.5 rounded-full bg-[#34d399]" />
            </span>
            moncerveaunumerique.app
          </span>
        </div>

        <div className="p-5 sm:p-6">
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-xs text-[var(--cn-faint)]"
          >
            {dateLabel}
          </motion.p>

          <h3 className="mt-1 min-h-[1.6em] text-lg font-semibold">
            {typed}
            {typed.length < GREETING.length && (
              <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] animate-pulse bg-[var(--cn-primary)]" />
            )}
          </h3>

          <p className="mt-5 text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--cn-ghost)]">
            Documents classés automatiquement
          </p>
          <motion.div
            variants={groupVariants}
            initial="hidden"
            animate={showDocs ? "show" : "hidden"}
            className="mt-3 flex flex-wrap gap-2"
          >
            {categories.map((c) => (
              <motion.span
                key={c.label}
                variants={chipVariants}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--cn-border)] bg-white/[0.03] px-3 py-1.5 text-xs text-[var(--cn-muted)]"
              >
                <span
                  className="size-1.5 rounded-full"
                  style={{ backgroundColor: c.tint }}
                />
                {c.label}
              </motion.span>
            ))}
          </motion.div>

          <p className="mt-5 text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--cn-ghost)]">
            Tâches priorisées
          </p>
          <motion.div
            variants={groupVariants}
            initial="hidden"
            animate={showTasks ? "show" : "hidden"}
            className="mt-3 space-y-2"
          >
            {taskDefs.map((task, i) => (
              <motion.div
                key={task.label}
                variants={rowVariants}
                className="flex items-center gap-2.5 rounded-lg border border-[var(--cn-border-soft)] bg-white/[0.02] px-3 py-2.5 text-sm"
              >
                <motion.span
                  key={checked[i] ? "done" : "pending"}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.35, ease: "backOut" }}
                  className="flex shrink-0"
                >
                  {checked[i] ? (
                    <CheckCircle2 className="size-4 text-[#34d399]" />
                  ) : (
                    <Circle className="size-4 text-[var(--cn-ghost)]" />
                  )}
                </motion.span>
                <span
                  className={
                    checked[i]
                      ? "text-[var(--cn-faint)] line-through transition-colors duration-300"
                      : "text-[var(--cn-fg)] transition-colors duration-300"
                  }
                >
                  {task.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
