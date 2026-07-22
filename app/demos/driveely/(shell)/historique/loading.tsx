import { Skeleton } from "@/components/margeo/ui/skeleton";

export default function HistoriqueLoading() {
  return (
    <div className="app-page space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-36" />
      </div>
      <Skeleton className="h-11 w-full rounded-xl" />
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-11 w-20 shrink-0 rounded-full" />
        ))}
      </div>
      <div className="space-y-3">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>
    </div>
  );
}
