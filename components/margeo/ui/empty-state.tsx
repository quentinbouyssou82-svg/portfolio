import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/margeo/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "app-fade-in relative flex flex-col items-center overflow-hidden rounded-2xl border border-mg-border bg-mg-card px-5 py-10 text-center shadow-mg-card sm:px-6 sm:py-12",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, var(--color-mg-accent-soft), transparent 70%)",
        }}
      />
      <span className="relative flex size-14 items-center justify-center rounded-2xl border border-mg-accent/20 bg-mg-accent-soft shadow-mg-glow">
        <Icon className="size-6 text-mg-accent" strokeWidth={1.75} />
      </span>
      <p className="relative mt-5 text-base font-semibold tracking-tight text-mg-foreground">
        {title}
      </p>
      <p className="relative mt-2 max-w-sm text-sm leading-relaxed text-mg-muted text-pretty">
        {description}
      </p>
      {action ? <div className="relative mt-6">{action}</div> : null}
    </div>
  );
}
