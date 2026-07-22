import { Skeleton } from "@/components/margeo/ui/skeleton";

export default function ProfilLoading() {
  return (
    <div className="app-page mx-auto max-w-2xl">
      <div className="space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64 max-w-full" />
      </div>
      <Skeleton className="h-24 rounded-2xl" />
      <Skeleton className="h-64 rounded-2xl" />
      <Skeleton className="h-48 rounded-2xl" />
      <Skeleton className="h-36 rounded-2xl" />
    </div>
  );
}
