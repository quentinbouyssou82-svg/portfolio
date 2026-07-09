import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-10 w-full rounded-xl border border-border bg-white/[0.04] px-3.5 text-sm text-foreground placeholder:text-faint outline-none transition-colors focus:border-accent/50 focus:ring-2 focus:ring-accent/20",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";
