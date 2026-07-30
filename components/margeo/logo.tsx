"use client";

import Image from "next/image";
import { PRODUCT_NAME } from "@/lib/margeo/brand";
import { cn } from "@/lib/margeo/utils";

const ICON_SIZES = { sm: 24, md: 28, lg: 36 } as const;

/**
 * Logo Driveely — dark/light interchangeables (même box, même crop object-cover).
 * Les deux assets sont en 1024×1024.
 */
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
  const box =
    size === "sm" ? "size-6" : size === "lg" ? "size-9" : "size-7";

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "driveely-logo-icon-wrap relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg",
          box,
        )}
        style={{ width: iconSize, height: iconSize }}
      >
        <Image
          src="/driveely/icon-64.png"
          alt=""
          width={iconSize}
          height={iconSize}
          className="driveely-logo-icon driveely-logo-icon-dark absolute inset-0 size-full object-cover"
          priority
          sizes={`${iconSize}px`}
        />
        <Image
          src="/driveely/icon-light-64.png"
          alt=""
          width={iconSize}
          height={iconSize}
          className="driveely-logo-icon driveely-logo-icon-light absolute inset-0 size-full object-cover"
          priority
          sizes={`${iconSize}px`}
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
    <span
      className={cn(
        "driveely-logo-icon-wrap relative inline-flex shrink-0 overflow-hidden rounded-lg",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src="/driveely/icon-64.png"
        alt={PRODUCT_NAME}
        width={size}
        height={size}
        className="driveely-logo-icon driveely-logo-icon-dark absolute inset-0 size-full rounded-lg object-cover"
        sizes={`${size}px`}
      />
      <Image
        src="/driveely/icon-light-64.png"
        alt={PRODUCT_NAME}
        width={size}
        height={size}
        className="driveely-logo-icon driveely-logo-icon-light absolute inset-0 size-full rounded-lg object-cover"
        sizes={`${size}px`}
      />
    </span>
  );
}
