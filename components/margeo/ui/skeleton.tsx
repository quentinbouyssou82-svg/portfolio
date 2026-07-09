import type { HTMLAttributes } from "react";
import { cn } from "@/lib/margeo/utils";

export function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-mg-shimmer rounded-lg bg-[linear-gradient(110deg,rgba(255,255,255,0.05)_40%,rgba(255,255,255,0.12)_50%,rgba(255,255,255,0.05)_60%)] bg-[length:200%_100%]",
        className
      )}
      {...props}
    />
  );
}
