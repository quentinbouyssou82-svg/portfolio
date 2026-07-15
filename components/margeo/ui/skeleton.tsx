import type { HTMLAttributes } from "react";
import { cn } from "@/lib/margeo/utils";

export function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-mg-shimmer rounded-xl bg-[linear-gradient(110deg,rgba(255,255,255,0.04)_40%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.04)_60%)] bg-[length:200%_100%]",
        className,
      )}
      aria-hidden
      {...props}
    />
  );
}
