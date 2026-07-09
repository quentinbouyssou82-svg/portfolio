import Image from "next/image";
import { PRODUCT_NAME } from "@/lib/margeo/brand";
import { cn } from "@/lib/margeo/utils";

export function Logo({
  className,
  withText = true,
  size = "md",
}: {
  className?: string;
  withText?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const iconSize = size === "sm" ? 24 : size === "lg" ? 36 : 28;

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#0c0c0f] ring-1 ring-white/10">
        <Image
          src="/uberly/icon.png"
          alt=""
          width={iconSize}
          height={iconSize}
          className="size-7 object-cover"
          priority
        />
      </span>
      {withText && (
        <span className="text-lg font-semibold tracking-tight text-mg-foreground">
          {PRODUCT_NAME}
        </span>
      )}
    </span>
  );
}

/** Icône seule (favicon, app shell mobile). */
export function LogoIcon({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <Image
      src="/uberly/icon.png"
      alt={PRODUCT_NAME}
      width={size}
      height={size}
      className={cn("rounded-lg object-cover", className)}
    />
  );
}
