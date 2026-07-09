"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import type { World } from "@/lib/lifeos/types";

export function LifeOSWorldCard({ world }: { world: World }) {
  const href =
    world.id === "fitness"
      ? "/demos/lifeos/fitness"
      : world.id === "nutrition"
        ? "/demos/lifeos/nutrition"
        : world.id === "work"
          ? "/demos/lifeos/work"
          : world.id === "piano"
            ? "/demos/lifeos/learn"
            : `/demos/lifeos/map?world=${world.id}`;

  return (
    <Link href={href} className="block shrink-0">
      <motion.div
        className="lifeos-card w-[140px] p-4"
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="text-2xl">{world.emoji}</span>
        <p className="mt-2 text-sm font-bold">{world.name}</p>
        <p className="text-xs text-[var(--lifeos-muted)]">Lv.{world.level}</p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--lifeos-bg)]">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${world.progress}%`, background: world.color }}
          />
        </div>
        <span className="mt-2 inline-flex items-center gap-0.5 text-xs font-semibold text-[var(--lifeos-purple)]">
          Enter <ChevronRight className="size-3" />
        </span>
      </motion.div>
    </Link>
  );
}
