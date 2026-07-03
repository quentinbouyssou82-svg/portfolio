import Link from "next/link";
import { cn } from "../../_lib/cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-[var(--cn-radius-sm)] transition-all duration-200 disabled:cursor-not-allowed select-none";

const variants: Record<Variant, string> = {
  primary:
    "text-white bg-[image:var(--cn-grad-primary)] shadow-[var(--cn-glow)] hover:brightness-110 hover:-translate-y-0.5 disabled:opacity-40 disabled:shadow-none disabled:hover:translate-y-0 disabled:hover:brightness-100",
  secondary:
    "text-[var(--cn-fg)] bg-[var(--cn-surface)] border border-[var(--cn-border)] font-medium hover:bg-[var(--cn-surface-2)]",
  ghost:
    "text-[var(--cn-muted)] font-medium hover:text-[var(--cn-fg)] hover:bg-white/[0.04]",
};

const sizes: Record<Size, string> = {
  md: "text-base px-6 py-2.5",
  lg: "text-base px-7 py-3",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  href,
}: CommonProps & { href: string }) {
  return (
    <Link
      href={href}
      className={cn(base, variants[variant], sizes[size], className)}
    >
      {children}
    </Link>
  );
}
