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
        "flex flex-col items-center rounded-2xl border border-mg-border bg-mg-card px-5 py-10 text-center shadow-mg-card sm:px-6 sm:py-12",
        className,
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-2xl border border-mg-accent/20 bg-mg-accent-soft">
        <Icon className="size-5 text-mg-accent" strokeWidth={1.75} />
      </span>
      <p className="mt-4 text-base font-semibold tracking-tight text-mg-foreground">
        {title}
      </p>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-mg-muted text-pretty">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
