import { Brain } from "lucide-react";
import { cn } from "@/lib/utils";

type McnLogoProps = {
  size?: number;
  className?: string;
  showLabel?: boolean;
};

export function McnLogo({ size = 20, className, showLabel = false }: McnLogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-[var(--mcn-border)] bg-[var(--mcn-surface)]">
        <Brain size={size} className="text-[var(--mcn-accent)]" strokeWidth={2} />
      </div>
      {showLabel ? (
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight text-[var(--mcn-fg)]">
            Mon Cerveau Numérique
          </p>
          <p className="truncate text-[10px] text-[var(--mcn-fg-subtle)]">Assistant de vie</p>
        </div>
      ) : null}
    </div>
  );
}
