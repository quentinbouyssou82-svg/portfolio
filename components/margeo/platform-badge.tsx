import { PlatformLogo } from "@/components/margeo/platform-logo";
import type { Platform } from "@/lib/margeo/types";
import { cn } from "@/lib/margeo/utils";

export function PlatformBadge({
  platform,
  className,
}: {
  platform: Platform | string;
  className?: string;
}) {
  return (
    <PlatformLogo
      platform={platform}
      size="xs"
      showLabel
      className={cn(className)}
    />
  );
}
