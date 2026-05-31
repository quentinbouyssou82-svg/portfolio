import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
};

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  default:
    "relative overflow-hidden border border-[var(--border)] bg-[linear-gradient(135deg,var(--primary),var(--primary-strong))] text-[var(--button-foreground)] shadow-[0_0_0_1px_rgba(255,255,255,0.12)_inset,0_20px_34px_-20px_var(--glow)] before:absolute before:inset-y-0 before:-left-1/2 before:w-1/2 before:skew-x-[-24deg] before:bg-white/18 before:opacity-0 before:blur-md before:transition-all before:duration-500 hover:scale-[1.012] hover:brightness-105 hover:before:left-[130%] hover:before:opacity-100",
  outline:
    "border border-[var(--border)] bg-[var(--surface)]/86 text-[var(--foreground)] shadow-[0_14px_26px_-22px_rgba(21,29,58,0.45)] hover:bg-[var(--surface-strong)] hover:border-[color:var(--ring)]",
  ghost:
    "border border-transparent text-[var(--foreground)] hover:border-[var(--border)] hover:bg-[var(--surface)]/70",
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  default: "h-11 px-6 text-sm",
  sm: "h-9 px-4 text-sm",
  lg: "h-12 px-7 text-base",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-medium tracking-[0.01em] transition-all duration-300 disabled:pointer-events-none disabled:opacity-40",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
