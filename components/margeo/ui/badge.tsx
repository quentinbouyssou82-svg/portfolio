import type { HTMLAttributes } from "react";
import { cn } from "@/lib/margeo/utils";

export function Badge({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-mg-border bg-[var(--mg-surface-muted)] px-2.5 py-0.5 text-xs font-medium leading-none text-mg-muted",
        className,
      )}
      {...props}
    />
  );
}
