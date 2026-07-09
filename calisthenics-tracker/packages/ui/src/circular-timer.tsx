import { motion } from "framer-motion";
import { cn } from "./cn.js";

interface CircularTimerProps {
  seconds: number;
  totalSeconds: number;
  label?: string;
  sublabel?: string;
  size?: number;
  className?: string;
  accent?: "accent" | "success" | "warning";
}

const accentStroke: Record<NonNullable<CircularTimerProps["accent"]>, string> = {
  accent: "#3b82f6",
  success: "#22c55e",
  warning: "#f59e0b",
};

export function CircularTimer({
  seconds,
  totalSeconds,
  label,
  sublabel,
  size = 200,
  className,
  accent = "accent",
}: CircularTimerProps) {
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = totalSeconds > 0 ? seconds / totalSeconds : 0;
  const offset = circumference * (1 - progress);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const display = `${mins}:${String(secs).padStart(2, "0")}`;

  return (
    <div className={cn("relative inline-flex flex-col items-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={accentStroke[accent]}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label && (
          <span className="cali-text-label text-cali-text-muted mb-1">{label}</span>
        )}
        <motion.span
          key={display}
          className="cali-text-display tabular-nums text-cali-text"
          initial={{ opacity: 0.6, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {display}
        </motion.span>
        {sublabel && (
          <span className="cali-text-caption text-cali-text-muted mt-1">{sublabel}</span>
        )}
      </div>
    </div>
  );
}
