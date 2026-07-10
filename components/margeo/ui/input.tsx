import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/margeo/utils";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-11 min-h-11 w-full rounded-xl border border-mg-border bg-white/[0.04] px-3.5 text-base text-mg-foreground placeholder:text-mg-faint outline-none transition-colors focus:border-mg-accent/50 focus:ring-2 focus:ring-mg-accent/20 sm:h-10 sm:min-h-10 sm:text-sm",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";
