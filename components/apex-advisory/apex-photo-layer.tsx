import Image from "next/image";
import type { ApexPhotoAsset } from "@/lib/apex-advisory/visuals";

export type ApexPhotoLayerVariant = "hero" | "ambient" | "card-texture" | "section-wash";

type ApexPhotoLayerProps = {
  photo: ApexPhotoAsset;
  variant: ApexPhotoLayerVariant;
  className?: string;
  parallax?: boolean;
  priority?: boolean;
};

function cn(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/** Additive photographic texture — always behind SVG line art. */
export function ApexPhotoLayer({
  photo,
  variant,
  className,
  parallax = true,
  priority = false,
}: ApexPhotoLayerProps) {
  return (
    <div
      className={cn("ax-photo-layer", `ax-photo-layer--${variant}`, className)}
      {...(parallax ? { "data-ax-visual-parallax": true } : {})}
      aria-hidden
    >
      <div className="ax-photo-layer__inner">
        <Image
          src={photo.src}
          alt=""
          fill
          quality={photo.quality ?? 80}
          sizes={photo.sizes ?? "100vw"}
          priority={priority}
          className="ax-photo-layer__img"
          style={photo.objectPosition ? { objectPosition: photo.objectPosition } : undefined}
        />
      </div>
      <div className="ax-photo-layer__veil" />
      {variant === "hero" ? <div className="ax-photo-layer__tint" aria-hidden /> : null}
    </div>
  );
}
