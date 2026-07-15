"use client";

import { cn } from "@/lib/margeo/utils";

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
      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-mg-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-mg-background disabled:cursor-not-allowed disabled:opacity-50"
      {...props}
    >
      <span
        aria-hidden
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-200",
          checked
            ? "border-mg-accent/40 bg-mg-accent-strong"
            : "border-mg-border bg-white/[0.08]",
        )}
      >
        <span
          className={cn(
            "absolute top-1/2 left-0.5 size-5 -translate-y-1/2 rounded-full bg-white shadow-sm transition-transform duration-200",
            checked && "translate-x-[19px]",
          )}
        />
      </span>
    </button>
  );
}
