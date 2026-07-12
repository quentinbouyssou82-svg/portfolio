import { cn } from "@/lib/margeo/utils";

export function Spinner({
  className,
  size = "md",
  label = "Chargement",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  label?: string;
}) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        "mg-spinner inline-block shrink-0",
        size === "sm" && "mg-spinner-sm",
        size === "lg" && "mg-spinner-lg",
        className,
      )}
    />
  );
}
