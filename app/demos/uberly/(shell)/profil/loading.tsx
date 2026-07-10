import { Skeleton } from "@/components/margeo/ui/skeleton";

export default function ProfilLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Skeleton className="h-16 w-64" />
      <Skeleton className="h-24 rounded-2xl" />
      <Skeleton className="h-64 rounded-2xl" />
      <Skeleton className="h-48 rounded-2xl" />
      <Skeleton className="h-36 rounded-2xl" />
    </div>
  );
}
