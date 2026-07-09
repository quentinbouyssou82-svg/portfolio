import { cn } from "./cn.js";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-white/8",
        className,
      )}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="cali-glass rounded-[var(--radius-cali-card)] p-4 space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}
