import type { HTMLAttributes } from "react";
import { cn } from "@/lib/margeo/utils";

export function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mg-skeleton animate-mg-shimmer rounded-xl bg-[length:200%_100%]",
        className,
      )}
      aria-hidden
      {...props}
    />
  );
}
