import { motion } from "framer-motion";
import { cn } from "./cn.js";

export interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  height?: "sm" | "md";
}

export function ProgressBar({
  value,
  max = 1,
  className,
  showLabel,
  height = "sm",
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          "overflow-hidden rounded-full bg-white/8",
          height === "sm" ? "h-1.5" : "h-2",
        )}
      >
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-cali-accent to-[#60a5fa]"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      {showLabel && (
        <p className="text-right cali-text-caption text-cali-text-muted tabular-nums">
          {Math.round(pct)}%
        </p>
      )}
    </div>
  );
}
