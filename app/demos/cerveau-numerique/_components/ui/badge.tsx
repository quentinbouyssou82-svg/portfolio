import { cn } from "../../_lib/cn";

export function Badge({
  children,
  className,
  icon,
}: {
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-[0.02em]",
        "border border-[var(--cn-primary-border)] bg-[var(--cn-primary-tint)] text-[var(--cn-primary)]",
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
