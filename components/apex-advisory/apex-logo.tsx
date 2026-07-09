import { cn } from "@/lib/utils";

export type ApexLogoVariant = "mark" | "lockup";
export type ApexLogoTone = "light" | "gold" | "muted";

type ApexLogoProps = {
  variant?: ApexLogoVariant;
  tone?: ApexLogoTone;
  className?: string;
};

const toneMap: Record<ApexLogoTone, { primary: string; accent: string; suffix: string }> = {
  light: { primary: "currentColor", accent: "var(--ax-gold)", suffix: "var(--ax-gold)" },
  gold: { primary: "var(--ax-gold)", accent: "var(--ax-gold-light)", suffix: "var(--ax-gold-light)" },
  muted: {
    primary: "var(--ax-text-muted)",
    accent: "var(--ax-gold-dark)",
    suffix: "var(--ax-gold-dark)",
  },
};

/**
 * Geometric open-frame mark — architectural, quiet luxury.
 * Three sides of a frame with a champagne accent at the open corner.
 */
function ApexMarkPaths({ primary, accent }: { primary: string; accent: string }) {
  return (
    <g className="ax-logo__mark" transform="translate(14.5 16) scale(1.08) translate(-14.5 -16) translate(0.5 0)">
      <path
        d="M7.5 6.5v19M7.5 6.5h14.5v11.5"
        fill="none"
        stroke={primary}
        strokeWidth="1.75"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      <path
        d="M22 18v3.5"
        fill="none"
        stroke={accent}
        strokeWidth="1.85"
        strokeLinecap="square"
        className="ax-logo__mark-accent"
      />
    </g>
  );
}

/*
 * ─── Alternate variants (reference) ───
 *
 * 1. Monogram PC — intertwined strokes:
 *    <path d="M8 6v20M8 6h10a5.5 5.5 0 0 1 0 11H8M20 17h4a4.5 4.5 0 0 0 0-9h-4" />
 *
 * 2. Open diamond — rotated square, one open vertex:
 *    <path d="M16 5l9 9-9 9-9-9 9-9M16 23v3" />
 *
 * 3. Wordmark-only — typographic lockup without mark (see ApexWordmark group below)
 *
 * 4. Full lockup — geometric mark + wordmark (shipped)
 */

function ApexWordmark({ primary, suffix }: { primary: string; suffix: string }) {
  return (
    <g className="ax-logo__wordmark">
      <text
        x="39"
        y="14.5"
        fill={primary}
        style={{
          fontFamily: "var(--font-apex-display), Georgia, serif",
          fontSize: "18px",
          fontWeight: 500,
          letterSpacing: "0.035em",
        }}
      >
        Palan
      </text>
      <text
        x="39"
        y="23.5"
        fill={suffix}
        style={{
          fontFamily: "var(--font-apex-sans), Inter, system-ui, sans-serif",
          fontSize: "11px",
          fontWeight: 500,
          letterSpacing: "0.12em",
        }}
      >
        CAPITAL
      </text>
    </g>
  );
}

export function ApexLogo({ variant = "lockup", tone = "light", className }: ApexLogoProps) {
  const colors = toneMap[tone];
  const isLockup = variant === "lockup";

  return (
    <svg
      className={cn(
        "ax-logo__svg",
        isLockup ? "ax-logo__svg--lockup" : "ax-logo__svg--mark",
        className,
      )}
      viewBox={isLockup ? "0 0 92 32" : "0 0 28 32"}
      preserveAspectRatio={isLockup ? "xMinYMid slice" : "xMidYMid meet"}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Palan Capital"
    >
      <ApexMarkPaths primary={colors.primary} accent={colors.accent} />
      {isLockup ? <ApexWordmark primary={colors.primary} suffix={colors.suffix} /> : null}
    </svg>
  );
}
