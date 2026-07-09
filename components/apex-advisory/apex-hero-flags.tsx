import type { ReactNode, SVGProps } from "react";

type FlagSvgProps = SVGProps<SVGSVGElement>;

function FlagFrame({ children, ...props }: FlagSvgProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 20 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      {...props}
    >
      <rect width="20" height="14" rx="2" fill="rgba(255,255,255,0.04)" />
      <rect
        x="0.5"
        y="0.5"
        width="19"
        height="13"
        rx="1.5"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="0.5"
      />
      {children}
    </svg>
  );
}

function FranceFlag(props: FlagSvgProps) {
  return (
    <FlagFrame {...props}>
      <rect x="1" y="1" width="5.33" height="12" rx="0.5" fill="#1B3F8B" />
      <rect x="6.33" y="1" width="5.34" height="12" fill="#FFFFFF" />
      <rect x="11.67" y="1" width="5.33" height="12" rx="0.5" fill="#CE1126" />
    </FlagFrame>
  );
}

function LuxembourgFlag(props: FlagSvgProps) {
  return (
    <FlagFrame {...props}>
      <rect x="1" y="1" width="18" height="3.67" rx="0.5" fill="#EF3340" />
      <rect x="1" y="4.67" width="18" height="3.66" fill="#FFFFFF" />
      <rect x="1" y="8.33" width="18" height="3.67" rx="0.5" fill="#00A1DE" />
    </FlagFrame>
  );
}

function UaeFlag(props: FlagSvgProps) {
  return (
    <FlagFrame {...props}>
      <rect x="1" y="1" width="18" height="3.67" rx="0.5" fill="#00732F" />
      <rect x="1" y="4.67" width="18" height="3.66" fill="#FFFFFF" />
      <rect x="1" y="8.33" width="18" height="3.67" rx="0.5" fill="#000000" />
      <rect x="1" y="1" width="4.5" height="12" rx="0.5" fill="#CE1126" />
    </FlagFrame>
  );
}

function PolesIcon(props: FlagSvgProps) {
  return (
    <svg
      viewBox="0 0 20 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      {...props}
    >
      <rect width="20" height="14" rx="2" fill="rgba(212, 196, 168, 0.06)" />
      <rect
        x="0.5"
        y="0.5"
        width="19"
        height="13"
        rx="1.5"
        stroke="rgba(212, 196, 168, 0.18)"
        strokeWidth="0.5"
      />
      <circle cx="6.5" cy="4.5" r="1.25" fill="rgba(212, 196, 168, 0.55)" />
      <circle cx="13.5" cy="4.5" r="1.25" fill="rgba(212, 196, 168, 0.4)" />
      <circle cx="6.5" cy="9.5" r="1.25" fill="rgba(212, 196, 168, 0.4)" />
      <circle cx="13.5" cy="9.5" r="1.25" fill="rgba(212, 196, 168, 0.55)" />
      <line
        x1="7.75"
        y1="4.5"
        x2="12.25"
        y2="4.5"
        stroke="rgba(212, 196, 168, 0.22)"
        strokeWidth="0.5"
      />
      <line
        x1="6.5"
        y1="5.75"
        x2="6.5"
        y2="8.25"
        stroke="rgba(212, 196, 168, 0.18)"
        strokeWidth="0.5"
      />
      <line
        x1="13.5"
        y1="5.75"
        x2="13.5"
        y2="8.25"
        stroke="rgba(212, 196, 168, 0.18)"
        strokeWidth="0.5"
      />
    </svg>
  );
}

export type ApexHeroFlagId = "france" | "luxembourg" | "uae" | "poles";

const FLAG_MAP = {
  france: FranceFlag,
  luxembourg: LuxembourgFlag,
  uae: UaeFlag,
  poles: PolesIcon,
} as const;

export function ApexHeroFlagBadge({ id, className }: { id: ApexHeroFlagId; className?: string }) {
  const Flag = FLAG_MAP[id];
  return <Flag className={className} />;
}
