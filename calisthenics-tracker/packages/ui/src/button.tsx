import { cva, type VariantProps } from "class-variance-authority";
import { motion, type HTMLMotionProps } from "framer-motion";
import { Loader2, Check } from "lucide-react";
import { forwardRef } from "react";
import { cn } from "./cn.js";

const buttonVariants = cva(
  [
    "relative inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "rounded-xl font-semibold select-none",
    "transition-colors duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cali-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-cali-bg",
    "disabled:pointer-events-none disabled:opacity-40",
    "shadow-cali-sm",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-cali-accent text-white shadow-[0_4px_14px_rgba(59,130,246,0.35)] hover:bg-[#4b8ff7] active:bg-[#2563eb]",
        secondary:
          "cali-glass text-cali-text hover:bg-cali-surface-hover active:bg-cali-bg-elevated",
        ghost:
          "bg-transparent text-cali-text-muted shadow-none hover:bg-white/5 hover:text-cali-text active:bg-white/8",
        success:
          "bg-cali-success text-white shadow-[0_4px_14px_rgba(34,197,94,0.3)] hover:bg-[#2dd46a] active:bg-[#16a34a]",
        danger:
          "bg-cali-danger text-white shadow-[0_4px_14px_rgba(239,68,68,0.3)] hover:bg-[#f87171] active:bg-[#dc2626]",
        warning:
          "bg-cali-warning text-black shadow-[0_4px_14px_rgba(245,158,11,0.25)] hover:bg-[#fbbf24] active:bg-[#d97706]",
      },
      size: {
        default: "h-12 min-h-12 px-4 text-[0.9375rem]",
        sm: "h-10 min-h-10 px-3 text-sm",
        lg: "h-14 min-h-14 px-5 text-base",
        icon: "h-12 w-12 min-h-12 min-w-12 shrink-0 p-0",
        pin: "h-[4.5rem] w-[4.5rem] min-h-[4.5rem] min-w-[4.5rem] p-0 text-[1.75rem] font-medium rounded-2xl",
        fab: "h-14 min-h-14 w-14 min-w-14 p-0 rounded-2xl",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      fullWidth: false,
    },
  },
);

export interface ButtonProps
  extends Omit<HTMLMotionProps<"button">, "children">,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  success?: boolean;
  children?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      loading,
      success,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading || success;

    return (
      <motion.button
        ref={ref}
        type="button"
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        disabled={isDisabled}
        whileTap={isDisabled ? undefined : { scale: 0.96 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        {...props}
      >
        {loading && <Loader2 className="h-5 w-5 shrink-0 animate-spin" />}
        {success && !loading && <Check className="h-5 w-5 shrink-0" />}
        {!loading && !success && children}
      </motion.button>
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
