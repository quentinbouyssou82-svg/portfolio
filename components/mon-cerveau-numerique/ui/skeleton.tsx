import { cn } from "@/lib/utils";

export function McnSkeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-[var(--mcn-surface-hover)]",
        className,
      )}
      {...props}
    />
  );
}
