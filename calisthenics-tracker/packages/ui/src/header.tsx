import type { ReactNode } from "react";
import { cn } from "./cn.js";

export interface HeaderProps {
  title: string;
  subtitle?: string;
  left?: ReactNode;
  right?: ReactNode;
  className?: string;
}

export function Header({ title, subtitle, left, right, className }: HeaderProps) {
  return (
    <header className={cn("mb-4 flex items-center gap-3", className)}>
      {left && <div className="shrink-0">{left}</div>}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-lg font-semibold">{title}</h1>
        {subtitle && (
          <p className="truncate text-xs text-cali-text-muted">{subtitle}</p>
        )}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </header>
  );
}
