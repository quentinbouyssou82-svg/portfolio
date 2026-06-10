import * as React from "react";
import { cn } from "@/lib/utils";

type McnBadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "secondary" | "outline" | "success" | "warning";
};

const variants: Record<NonNullable<McnBadgeProps["variant"]>, string> = {
  default: "border-[var(--mcn-accent)]/30 bg-[var(--mcn-accent)]/10 text-[var(--mcn-accent)]",
  secondary: "border-[var(--mcn-border)] bg-[var(--mcn-surface)] text-[var(--mcn-fg-muted)]",
  outline: "border-[var(--mcn-border)] text-[var(--mcn-fg-muted)]",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-400",
};

export function McnBadge({ className, variant = "default", ...props }: McnBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
