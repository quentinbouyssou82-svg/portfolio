"use client";

import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

export function LifeOSStreakChip({
  streak,
  compact = false,
}: {
  streak: number;
  compact?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-bold text-[var(--lifeos-orange)]",
        compact ? "bg-[var(--lifeos-orange-soft)] px-2 py-0.5 text-xs" : "text-sm",
      )}
    >
      <Flame className={cn("fill-[var(--lifeos-orange)]", compact ? "size-3" : "size-4")} />
      {streak}
    </span>
  );
}
