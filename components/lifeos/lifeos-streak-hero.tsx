"use client";

import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { useLifeOS } from "@/lib/lifeos/provider";

export function LifeOSStreakHero() {
  const { profile } = useLifeOS();

  return (
    <motion.section
      className="lifeos-card-hero relative overflow-hidden p-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="relative z-10 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--lifeos-orange)]">
            Daily streak
          </p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight">
            {profile.streak}{" "}
            <span className="text-xl font-semibold text-[var(--lifeos-muted)]">days</span>
          </p>
          <p className="mt-2 text-sm text-[var(--lifeos-muted)]">
            Legendary flame · Don&apos;t break it today!
          </p>
        </div>
        <div className="lifeos-flame-glow lifeos-flame-pulse flex size-20 items-center justify-center rounded-full bg-gradient-to-b from-[#FFEDD5] to-[#FED7AA]">
          <Flame className="size-12 fill-[var(--lifeos-orange)] text-[var(--lifeos-orange)]" />
        </div>
      </div>
      <div className="pointer-events-none absolute -right-8 -top-8 size-40 rounded-full bg-[var(--lifeos-purple-soft)] opacity-60 blur-3xl" />
    </motion.section>
  );
}
