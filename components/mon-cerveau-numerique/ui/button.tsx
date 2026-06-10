import * as React from "react";
import { cn } from "@/lib/utils";

type McnButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost" | "secondary" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
};

const variants: Record<NonNullable<McnButtonProps["variant"]>, string> = {
  default:
    "bg-[var(--mcn-accent)] text-white shadow-[0_1px_2px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.12)] hover:bg-[var(--mcn-accent-hover)] active:scale-[0.98]",
  outline:
    "border border-[var(--mcn-border)] bg-transparent text-[var(--mcn-fg)] hover:bg-[var(--mcn-surface-hover)] hover:border-[var(--mcn-border-strong)]",
  ghost:
    "text-[var(--mcn-fg-muted)] hover:bg-[var(--mcn-surface-hover)] hover:text-[var(--mcn-fg)]",
  secondary:
    "border border-[var(--mcn-border)] bg-[var(--mcn-surface)] text-[var(--mcn-fg)] hover:bg-[var(--mcn-surface-hover)]",
  destructive:
    "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/15",
};

const sizes: Record<NonNullable<McnButtonProps["size"]>, string> = {
  default: "h-9 px-4 text-sm",
  sm: "h-8 px-3 text-xs",
  lg: "h-10 px-5 text-sm",
  icon: "size-9 p-0",
};

export const McnButton = React.forwardRef<HTMLButtonElement, McnButtonProps>(
  ({ className, variant = "default", size = "default", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mcn-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--mcn-bg)]",
        "disabled:pointer-events-none disabled:opacity-40",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);
McnButton.displayName = "McnButton";
