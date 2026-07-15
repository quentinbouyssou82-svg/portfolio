import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Spinner } from "@/components/margeo/ui/spinner";
import { cn } from "@/lib/margeo/utils";

const buttonVariants = cva(
  "app-btn inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-[background-color,border-color,box-shadow,opacity,transform,color] duration-200 outline-none focus-visible:ring-2 focus-visible:ring-mg-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-mg-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "app-btn-primary bg-mg-accent-strong text-white font-semibold",
        secondary:
          "app-btn-secondary bg-white/[0.06] text-mg-foreground border border-mg-border",
        ghost: "text-mg-muted hover:text-mg-foreground hover:bg-white/[0.06]",
        outline:
          "border border-mg-border-strong text-mg-foreground hover:bg-white/[0.05]",
        danger:
          "bg-mg-stop-soft text-mg-stop border border-mg-stop/20 hover:bg-mg-stop/20",
      },
      size: {
        sm: "h-9 min-h-9 px-3.5 text-xs",
        md: "h-11 min-h-11 px-4",
        lg: "h-12 min-h-12 px-5 text-[0.9375rem]",
        icon: "h-11 w-11 min-h-11 min-w-11",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Spinner size="sm" /> : null}
      {children}
    </button>
  ),
);
Button.displayName = "Button";

export { buttonVariants };
