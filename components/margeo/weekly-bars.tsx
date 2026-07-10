"use client";

import { motion } from "framer-motion";
import { formatEur } from "@/lib/margeo/utils";

interface WeeklyBarsProps {
  data: { day: string; net: number }[];
}

/** Barres des 7 derniers jours — lisible en 3 secondes. */
export function WeeklyBars({ data }: WeeklyBarsProps) {
  const week = data.slice(-7);
  const max = Math.max(...week.map((d) => d.net), 1);
  const total = week.reduce((s, d) => s + d.net, 0);
  const hasData = week.some((d) => d.net > 0);

  if (!hasData) {
    return (
      <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-mg-border text-center">
        <p className="text-sm text-mg-muted">Aucun gain cette semaine</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between">
        <p className="text-2xl font-bold tracking-tight text-mg-foreground">
          {formatEur(total)}
        </p>
        <p className="text-xs text-mg-faint">7 derniers jours</p>
      </div>
      <div className="flex h-24 items-end gap-2 sm:gap-3">
        {week.map((d, i) => {
          const barH = Math.max(d.net > 0 ? 12 : 4, (d.net / max) * 88);
          return (
            <div
              key={`${d.day}-${i}`}
              className="flex flex-1 flex-col items-center gap-2"
            >
              <motion.div
                className={
                  d.net > 0
                    ? "w-full rounded-md bg-mg-go/85"
                    : "w-full rounded-md bg-mg-border"
                }
                initial={{ height: 0 }}
                animate={{ height: barH }}
                transition={{
                  duration: 0.45,
                  delay: i * 0.05,
                  ease: [0.21, 0.47, 0.32, 0.98],
                }}
                title={`${d.day}: ${formatEur(d.net)}`}
              />
              <span className="text-[10px] font-medium text-mg-faint capitalize">
                {d.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
