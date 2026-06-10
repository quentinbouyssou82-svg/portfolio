import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type McnEmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
};

export function McnEmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: McnEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--mcn-border)]",
        "bg-[var(--mcn-surface)]/50 px-6 py-12 text-center",
        className,
      )}
    >
      <div className="mb-4 flex size-10 items-center justify-center rounded-lg border border-[var(--mcn-border)] bg-[var(--mcn-bg)]">
        <Icon className="size-4 text-[var(--mcn-fg-muted)]" />
      </div>
      <p className="text-sm font-medium text-[var(--mcn-fg)]">{title}</p>
      <p className="mt-1 max-w-xs text-xs text-[var(--mcn-fg-muted)]">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
