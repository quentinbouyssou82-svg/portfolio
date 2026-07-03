"use client";

import { motion } from "framer-motion";

export function WizardProgress({
  current,
  total,
  section,
}: {
  current: number;
  total: number;
  section: string;
}) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="mx-auto mt-6 w-full max-w-xl px-6">
      <div className="flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-[image:var(--cn-grad-progress)]"
            initial={false}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
        <span className="shrink-0 text-xs tabular-nums text-[var(--cn-faint)]">
          {current} / {total}
        </span>
      </div>
      <p className="mt-2 text-xs text-[var(--cn-faint)]">Section : {section}</p>
    </div>
  );
}
