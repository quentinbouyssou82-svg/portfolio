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
    <div className={cn("app-empty-state app-fade-in", className)}>
      <span className="app-empty-state-icon" aria-hidden>
        <Icon className="size-[1.375rem]" strokeWidth={1.75} />
      </span>
      <p className="app-empty-state-title">{title}</p>
      <p className="app-empty-state-desc">{description}</p>
      {action ? <div className="app-empty-state-action">{action}</div> : null}
    </div>
  );
}
