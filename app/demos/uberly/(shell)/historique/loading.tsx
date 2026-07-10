import { Skeleton } from "@/components/margeo/ui/skeleton";

export default function HistoriqueLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-16 w-full max-w-md" />
      <Skeleton className="h-11 w-full" />
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full" />
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
