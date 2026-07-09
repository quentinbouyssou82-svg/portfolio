import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-accent-strong text-[#04120c] font-semibold hover:bg-accent shadow-[0_0_0_1px_rgba(52,211,153,0.4),0_4px_20px_rgba(16,185,129,0.25)] hover:shadow-[0_0_0_1px_rgba(52,211,153,0.6),0_4px_28px_rgba(16,185,129,0.4)]",
        secondary:
          "bg-white/[0.06] text-foreground border border-border hover:bg-white/[0.1] hover:border-border-strong",
        ghost: "text-muted hover:text-foreground hover:bg-white/[0.06]",
        outline:
          "border border-border-strong text-foreground hover:bg-white/[0.05]",
        danger:
          "bg-stop-soft text-stop border border-stop/20 hover:bg-stop/20",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-base rounded-2xl",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { buttonVariants };
