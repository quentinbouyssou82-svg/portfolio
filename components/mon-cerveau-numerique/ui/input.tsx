import * as React from "react";
import { cn } from "@/lib/utils";

export const McnInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type = "text", ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      "flex h-9 w-full rounded-lg border border-[var(--mcn-border)] bg-[var(--mcn-surface)] px-3 py-1 text-sm text-[var(--mcn-fg)]",
      "placeholder:text-[var(--mcn-fg-subtle)] transition-colors duration-200",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mcn-ring)] focus-visible:border-[var(--mcn-border-strong)]",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
McnInput.displayName = "McnInput";
