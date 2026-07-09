import { PLATFORM_COLORS } from "@/lib/data";
import type { Platform } from "@/lib/types";
import { cn } from "@/lib/utils";

export function PlatformBadge({
  platform,
  className,
}: {
  platform: Platform;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium text-muted",
        className
      )}
    >
      <span
        className="size-2 rounded-full"
        style={{ backgroundColor: PLATFORM_COLORS[platform] }}
      />
      {platform}
    </span>
  );
}
