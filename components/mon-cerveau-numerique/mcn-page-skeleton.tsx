import { McnSkeleton } from "@/components/mon-cerveau-numerique/ui/skeleton";

type McnPageSkeletonProps = {
  variant?: "dashboard" | "list" | "form";
};

export function McnPageSkeleton({ variant = "dashboard" }: McnPageSkeletonProps) {
  if (variant === "form") {
    return (
      <div className="mx-auto w-full max-w-md space-y-4 px-4 py-16">
        <McnSkeleton className="mx-auto size-14 rounded-xl" />
        <McnSkeleton className="mx-auto h-6 w-48" />
        <McnSkeleton className="mx-auto h-4 w-32" />
        <McnSkeleton className="h-10 w-full rounded-lg" />
        <McnSkeleton className="h-px w-full" />
        <McnSkeleton className="h-9 w-full rounded-lg" />
        <McnSkeleton className="h-9 w-full rounded-lg" />
        <McnSkeleton className="h-10 w-full rounded-lg" />
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div className="space-y-6 p-4 md:p-8">
        <div className="space-y-2">
          <McnSkeleton className="h-4 w-24" />
          <McnSkeleton className="h-8 w-56" />
          <McnSkeleton className="h-4 w-72" />
        </div>
        <McnSkeleton className="h-10 w-full rounded-lg" />
        {Array.from({ length: 4 }).map((_, i) => (
          <McnSkeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-8">
      <div className="space-y-2">
        <McnSkeleton className="h-3 w-32" />
        <McnSkeleton className="h-8 w-48" />
        <McnSkeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <McnSkeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <McnSkeleton className="h-36 w-full rounded-xl" />
      <div className="grid gap-6 lg:grid-cols-2">
        <McnSkeleton className="h-48 rounded-xl" />
        <McnSkeleton className="h-48 rounded-xl" />
      </div>
    </div>
  );
}
