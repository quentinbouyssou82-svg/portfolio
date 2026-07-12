import { AlertCircle } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/margeo/ui/button";
import { cn } from "@/lib/margeo/utils";

interface ErrorStateProps {
  title: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  action?: ReactNode;
  className?: string;
}

export function ErrorState({
  title,
  description,
  onRetry,
  retryLabel = "Réessayer",
  action,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn("app-error-state", className)}
      role="alert"
    >
      <span className="app-error-state-icon" aria-hidden>
        <AlertCircle className="size-5" strokeWidth={1.75} />
      </span>
      <p className="app-error-state-title">{title}</p>
      {description ? (
        <p className="app-error-state-desc">{description}</p>
      ) : null}
      {(onRetry || action) && (
        <div className="app-error-state-action">
          {action ??
            (onRetry ? (
              <Button variant="secondary" size="md" onClick={onRetry}>
                {retryLabel}
              </Button>
            ) : null)}
        </div>
      )}
    </div>
  );
}
