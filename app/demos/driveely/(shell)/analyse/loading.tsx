import { Skeleton } from "@/components/margeo/ui/skeleton";

export default function AnalyseLoading() {
  return (
    <div className="app-page mx-auto max-w-3xl">
      <div className="flex flex-col items-center gap-3 text-center">
        <Skeleton className="h-8 w-40 rounded-full" />
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-64 max-w-full" />
      </div>
      <Skeleton className="h-48 w-full rounded-2xl" />
      <Skeleton className="h-36 w-full rounded-2xl" />
    </div>
  );
}
