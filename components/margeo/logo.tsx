import Image from "next/image";
import { PRODUCT_NAME } from "@/lib/margeo/brand";
import { cn } from "@/lib/margeo/utils";

const ICON_SIZES = { sm: 24, md: 28, lg: 36 } as const;

export function Logo({
  className,
  withText = true,
  size = "md",
}: {
  className?: string;
  withText?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const iconSize = ICON_SIZES[size];

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="uberly-logo-icon-wrap relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg">
        <Image
          src="/uberly/icon.png"
          alt=""
          width={iconSize}
          height={iconSize}
          className="uberly-logo-icon uberly-logo-icon-dark size-7 object-cover"
          priority
        />
        <Image
          src="/uberly/icon-light.png"
          alt=""
          width={iconSize}
          height={iconSize}
          className="uberly-logo-icon uberly-logo-icon-light size-7 object-cover"
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
export function LogoIcon({
  className,
  size = 28,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <span className="uberly-logo-icon-wrap relative inline-flex shrink-0 overflow-hidden rounded-lg">
      <Image
        src="/uberly/icon.png"
        alt={PRODUCT_NAME}
        width={size}
        height={size}
        className={cn(
          "uberly-logo-icon uberly-logo-icon-dark rounded-lg object-cover",
          className,
        )}
      />
      <Image
        src="/uberly/icon-light.png"
        alt={PRODUCT_NAME}
        width={size}
        height={size}
        className={cn(
          "uberly-logo-icon uberly-logo-icon-light rounded-lg object-cover",
          className,
        )}
      />
    </span>
  );
}
