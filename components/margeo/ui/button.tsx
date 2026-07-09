import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/margeo/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-mg-accent/50 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-mg-accent-strong text-[#04120c] font-semibold hover:bg-mg-accent shadow-[0_0_0_1px_rgba(52,211,153,0.4),0_4px_20px_rgba(16,185,129,0.25)] hover:shadow-[0_0_0_1px_rgba(52,211,153,0.6),0_4px_28px_rgba(16,185,129,0.4)]",
        secondary:
          "bg-white/[0.06] text-mg-foreground border border-mg-border hover:bg-white/[0.1] hover:border-mg-border-strong",
        ghost: "text-mg-muted hover:text-mg-foreground hover:bg-white/[0.06]",
        outline:
          "border border-mg-border-strong text-mg-foreground hover:bg-white/[0.05]",
        danger:
          "bg-mg-stop-soft text-mg-stop border border-mg-stop/20 hover:bg-mg-stop/20",
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
