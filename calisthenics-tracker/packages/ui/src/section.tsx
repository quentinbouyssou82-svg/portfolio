import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./cn.js";

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  title?: string;
  description?: string;
}

export function Section({
  children,
  title,
  description,
  className,
  ...props
}: SectionProps) {
  return (
    <section className={cn("flex flex-col gap-3", className)} {...props}>
      {(title || description) && (
        <div className="space-y-1">
          {title && <h2 className="text-sm font-medium text-cali-text">{title}</h2>}
          {description && (
            <p className="text-sm text-cali-text-muted leading-relaxed">{description}</p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}
