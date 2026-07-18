import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/margeo/utils";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-11 min-h-11 w-full rounded-xl border border-mg-border bg-[var(--mg-surface-muted)] px-3.5 text-base text-mg-foreground placeholder:text-mg-faint outline-none transition-[border-color,box-shadow,background-color] duration-200",
      "hover:border-mg-border-strong hover:bg-[var(--mg-nav-hover)]",
      "focus:border-mg-accent/50 focus:bg-[var(--mg-nav-hover)] focus:ring-2 focus:ring-mg-accent/20",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "sm:h-10 sm:min-h-10 sm:text-sm",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
