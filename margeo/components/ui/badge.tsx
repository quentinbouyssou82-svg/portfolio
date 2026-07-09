import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-white/[0.05] px-2.5 py-0.5 text-xs font-medium text-muted",
        className
      )}
      {...props}
    />
  );
}
