import type { ApexVisualConfig } from "@/lib/apex-advisory/visuals";
import { ApexAbstractMotif } from "./apex-abstract-motif";
import { ApexPhotoLayer } from "./apex-photo-layer";

export type ApexVisualVariant = "ambient" | "thumb" | "card-bg";

type ApexVisualProps = {
  visual: ApexVisualConfig;
  variant: ApexVisualVariant;
  className?: string;
  parallax?: boolean;
  reveal?: boolean;
};

function cn(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function ApexVisual({
  visual,
  variant,
  className,
  parallax = true,
  reveal = true,
}: ApexVisualProps) {
  const photoVariant = variant === "card-bg" ? "card-texture" : "ambient";

  return (
    <div
      className={cn("ax-visual", `ax-visual--${variant}`, className)}
      {...(reveal ? { "data-ax-visual-reveal": true } : {})}
      {...(parallax && variant !== "card-bg" ? { "data-ax-visual-parallax": true } : {})}
    >
      {visual.photo ? (
        <ApexPhotoLayer
          photo={visual.photo}
          variant={photoVariant}
          parallax={parallax && variant !== "card-bg"}
        />
      ) : null}
      <div className="ax-visual__inner">
        <ApexAbstractMotif motif={visual.motif} compact={variant === "thumb"} />
      </div>
      {variant !== "card-bg" ? <div className="ax-visual__veil" aria-hidden /> : null}
    </div>
  );
}
