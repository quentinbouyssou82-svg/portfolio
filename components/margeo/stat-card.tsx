"use client";

import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "@/components/margeo/ui/card";
import { cn } from "@/lib/margeo/utils";

interface StatCardProps {
  label: string;
  icon: LucideIcon;
  children: React.ReactNode;
  /** Variation vs période précédente, ex "+12,6 €". */
  delta?: string;
  deltaPositive?: boolean;
  footer?: string;
  className?: string;
}

export function StatCard({
  label,
  icon: Icon,
  children,
  delta,
  deltaPositive = true,
  footer,
  className,
}: StatCardProps) {
  return (
    <Card interactive className={cn("p-5", className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-mg-muted">{label}</p>
        <span className="flex size-8 items-center justify-center rounded-lg bg-white/[0.05]">
          <Icon className="size-4 text-mg-muted" />
        </span>
      </div>
      <div className="mt-3 text-3xl font-bold tracking-tight text-mg-foreground">
        {children}
      </div>
      {(delta || footer) && (
        <p className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-mg-faint">
          {delta && (
            <span
              className={cn(
                "inline-flex items-center gap-1 font-semibold",
                deltaPositive ? "text-mg-go" : "text-mg-stop"
              )}
            >
              {deltaPositive ? (
                <TrendingUp className="size-3.5" />
              ) : (
                <TrendingDown className="size-3.5" />
              )}
              {delta}
            </span>
          )}
          {footer}
        </p>
      )}
    </Card>
  );
}
