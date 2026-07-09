"use client";

import { motion } from "framer-motion";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { WORLDS } from "@/lib/lifeos/constants";
import type { Quest } from "@/lib/lifeos/types";

export function LifeOSQuestRow({
  quest,
  onComplete,
}: {
  quest: Quest;
  onComplete: (id: string) => void;
}) {
  const world = WORLDS.find((w) => w.id === quest.worldId);
  const done = quest.status === "complete";

  return (
    <motion.button
      type="button"
      disabled={done}
      onClick={() => onComplete(quest.id)}
      className={cn(
        "lifeos-card flex w-full items-center gap-4 p-4 text-left transition active:scale-[0.98]",
        done && "lifeos-quest-complete",
        quest.isHero && !done && "lifeos-hero-quest",
      )}
      whileTap={done ? undefined : { scale: 0.98 }}
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl text-lg",
          done ? "bg-[var(--lifeos-green)] text-white" : "bg-[var(--lifeos-bg)]",
        )}
      >
        {done ? <Check className="size-5" strokeWidth={3} /> : world?.emoji}
      </span>
      <div className="min-w-0 flex-1">
        <p className={cn("font-semibold", done && "text-[var(--lifeos-muted)] line-through")}>
          {quest.title}
        </p>
        <p className="text-xs text-[var(--lifeos-muted)]">
          {world?.name} · +{quest.xp} XP
        </p>
      </div>
      {!done && <ChevronRight className="size-5 shrink-0 text-[var(--lifeos-muted)]" />}
    </motion.button>
  );
}
