"use client";

import { cn } from "@/lib/utils";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  "aria-label"?: string;
}

export function Switch({
  checked,
  onCheckedChange,
  disabled,
  ...props
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 cursor-pointer rounded-full border border-border transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-accent-strong" : "bg-white/[0.08]"
      )}
      {...props}
    >
      <span
        className={cn(
          "absolute top-1/2 left-0.5 size-5 -translate-y-1/2 rounded-full bg-white shadow-sm transition-transform duration-200",
          checked && "translate-x-[19px]"
        )}
      />
    </button>
  );
}
