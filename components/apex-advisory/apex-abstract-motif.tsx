import type { ReactNode } from "react";
import type { ApexAbstractMotif } from "@/lib/apex-advisory/visuals";

type ApexAbstractMotifProps = {
  motif: ApexAbstractMotif;
  className?: string;
  /** Compact rendering for timeline thumbs */
  compact?: boolean;
};

const GOLD = "rgba(212, 196, 168, 0.55)";
const GOLD_SOFT = "rgba(212, 196, 168, 0.22)";
const GOLD_FAINT = "rgba(212, 196, 168, 0.08)";
const STROKE = "rgba(212, 196, 168, 0.35)";

function MotifSvg({
  children,
  viewBox = "0 0 400 500",
  className,
  label,
}: {
  children: ReactNode;
  viewBox?: string;
  className?: string;
  label: string;
}) {
  return (
    <svg
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden={!label}
      role={label ? "img" : undefined}
      aria-label={label || undefined}
    >
      {children}
    </svg>
  );
}

function ExpertiseFinancement() {
  return (
    <MotifSvg viewBox="0 0 400 300" label="Grille structurée">
      {[0, 1, 2, 3, 4].map((i) => (
        <line key={`v${i}`} x1={80 + i * 60} y1="40" x2={80 + i * 60} y2="260" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <line key={`h${i}`} x1="60" y1={60 + i * 55} x2="340" y2={60 + i * 55} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
      ))}
      <path d="M80 220 L200 100 L320 180" stroke={STROKE} strokeWidth="1" className="ax-motif-path ax-motif-path--flow" />
      <rect x="140" y="120" width="120" height="80" rx="2" stroke={GOLD_SOFT} strokeWidth="0.75" fill={GOLD_FAINT} />
      <circle cx="200" cy="100" r="3" fill={GOLD} />
    </MotifSvg>
  );
}

function ExpertiseDette() {
  return (
    <MotifSvg viewBox="0 0 400 300" label="Courbes">
      <path
        d="M40 200 Q120 80 200 160 T360 100"
        stroke={STROKE}
        strokeWidth="1.25"
        className="ax-motif-path ax-motif-path--flow"
      />
      <path
        d="M40 230 Q140 120 220 190 T360 130"
        stroke={GOLD_SOFT}
        strokeWidth="0.75"
        className="ax-motif-path ax-motif-path--flow ax-motif-path--delay"
      />
      <ellipse cx="200" cy="160" rx="100" ry="60" fill={GOLD_FAINT} className="ax-motif-blob ax-motif-blob--1" />
    </MotifSvg>
  );
}

function ExpertisePatrimoine() {
  return (
    <MotifSvg viewBox="0 0 400 300" label="Ellipses">
      <ellipse cx="200" cy="150" rx="140" ry="90" stroke={STROKE} strokeWidth="0.75" className="ax-motif-orbit ax-motif-orbit--1" />
      <ellipse cx="200" cy="150" rx="90" ry="55" stroke={GOLD_SOFT} strokeWidth="0.5" className="ax-motif-orbit ax-motif-orbit--2" />
      <ellipse cx="200" cy="150" rx="40" ry="25" fill={GOLD_FAINT} />
      <circle cx="200" cy="150" r="4" fill={GOLD} />
    </MotifSvg>
  );
}

function ExpertiseLevee() {
  return (
    <MotifSvg viewBox="0 0 400 300" label="Trajectoires">
      <path d="M60 240 L140 180 L220 200 L300 80" stroke={STROKE} strokeWidth="1" strokeLinecap="round" className="ax-motif-path ax-motif-path--flow" />
      <path d="M60 260 L150 210 L240 220 L320 120" stroke={GOLD_SOFT} strokeWidth="0.75" strokeLinecap="round" className="ax-motif-path ax-motif-path--delay" />
      <circle cx="300" cy="80" r="4" fill={GOLD} className="ax-motif-node" />
      <circle cx="140" cy="180" r="2" fill={GOLD_SOFT} />
      <circle cx="220" cy="200" r="2" fill={GOLD_SOFT} />
    </MotifSvg>
  );
}

function ConvictionStructurer() {
  return (
    <MotifSvg viewBox="0 0 120 90" label="Nœuds">
      <line x1="20" y1="70" x2="60" y2="30" stroke={STROKE} strokeWidth="0.75" />
      <line x1="60" y1="30" x2="100" y2="70" stroke={STROKE} strokeWidth="0.75" />
      <line x1="20" y1="70" x2="100" y2="70" stroke={GOLD_SOFT} strokeWidth="0.5" />
      <circle cx="20" cy="70" r="4" fill={GOLD_FAINT} stroke={STROKE} strokeWidth="0.75" />
      <circle cx="60" cy="30" r="5" fill={GOLD} className="ax-motif-node" />
      <circle cx="100" cy="70" r="4" fill={GOLD_FAINT} stroke={STROKE} strokeWidth="0.75" />
    </MotifSvg>
  );
}

function ConvictionValeur() {
  return (
    <MotifSvg viewBox="0 0 120 90" label="Rayonnement">
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const x2 = 60 + Math.cos(rad) * 38;
        const y2 = 45 + Math.sin(rad) * 28;
        return (
          <line key={deg} x1="60" y1="45" x2={x2} y2={y2} stroke={deg % 90 === 0 ? STROKE : GOLD_SOFT} strokeWidth={deg % 90 === 0 ? 0.75 : 0.5} />
        );
      })}
      <circle cx="60" cy="45" r="8" fill={GOLD_FAINT} stroke={GOLD} strokeWidth="0.75" className="ax-motif-node" />
    </MotifSvg>
  );
}

function ConvictionAligner() {
  return (
    <MotifSvg viewBox="0 0 120 90" label="Orbite">
      <ellipse cx="60" cy="45" rx="42" ry="28" stroke={STROKE} strokeWidth="0.75" className="ax-motif-orbit ax-motif-orbit--1" />
      <circle cx="60" cy="45" r="4" fill={GOLD} />
      <circle cx="98" cy="45" r="3" fill={GOLD_SOFT} className="ax-motif-node ax-motif-node--orbit" />
    </MotifSvg>
  );
}

function AudienceDirigeants() {
  return (
    <MotifSvg viewBox="0 0 120 90" label="Champ">
      {[0, 1, 2].map((r) => (
        <rect key={r} x={20 + r * 8} y={20 + r * 6} width={80 - r * 16} height={50 - r * 10} rx="1" stroke={r === 0 ? STROKE : GOLD_SOFT} strokeWidth="0.5" fill="none" />
      ))}
      <line x1="60" y1="20" x2="60" y2="70" stroke={GOLD_FAINT} strokeWidth="0.5" />
    </MotifSvg>
  );
}

function AudiencePatrimoine() {
  return (
    <MotifSvg viewBox="0 0 120 90" label="Courbe">
      <path d="M15 65 Q60 15 105 65" stroke={STROKE} strokeWidth="1" fill="none" className="ax-motif-path ax-motif-path--flow" />
      <path d="M25 70 Q60 30 95 70" stroke={GOLD_SOFT} strokeWidth="0.5" fill="none" />
      <circle cx="60" cy="35" r="3" fill={GOLD} className="ax-motif-node" />
    </MotifSvg>
  );
}

function AudienceFonds() {
  return (
    <MotifSvg viewBox="0 0 120 90" label="Spectre">
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={18 + i * 18} y={25 + i * 4} width="8" height={40 - i * 6} rx="1" fill={i === 2 ? GOLD : GOLD_FAINT} opacity={0.4 + i * 0.12} />
      ))}
    </MotifSvg>
  );
}

function AudienceInvestisseurs() {
  return (
    <MotifSvg viewBox="0 0 120 90" label="Treillis">
      {[0, 1, 2, 3].map((row) =>
        [0, 1, 2, 3].map((col) => (
          <circle
            key={`${row}-${col}`}
            cx={22 + col * 26}
            cy={18 + row * 20}
            r={row === 1 && col === 1 ? 3.5 : 2}
            fill={row === 1 && col === 1 ? GOLD : GOLD_SOFT}
            opacity={row === 1 && col === 1 ? 1 : 0.5}
          />
        )),
      )}
      <line x1="22" y1="18" x2="100" y2="78" stroke={GOLD_FAINT} strokeWidth="0.5" />
      <line x1="100" y1="18" x2="22" y2="78" stroke={GOLD_FAINT} strokeWidth="0.5" />
    </MotifSvg>
  );
}

const MOTIF_MAP: Record<ApexAbstractMotif, () => ReactNode> = {
  "hero-atmosphere": () => null,
  "expertise-financement": ExpertiseFinancement,
  "expertise-dette": ExpertiseDette,
  "expertise-patrimoine": ExpertisePatrimoine,
  "expertise-levee": ExpertiseLevee,
  "conviction-structurer": ConvictionStructurer,
  "conviction-valeur": ConvictionValeur,
  "conviction-aligner": ConvictionAligner,
  "audience-dirigeants": AudienceDirigeants,
  "audience-patrimoine": AudiencePatrimoine,
  "audience-fonds": AudienceFonds,
  "audience-investisseurs": AudienceInvestisseurs,
};

export function ApexAbstractMotif({ motif, className, compact }: ApexAbstractMotifProps) {
  const Render = MOTIF_MAP[motif];
  if (!Render || motif === "hero-atmosphere") return null;

  return (
    <div className={["ax-motif", compact ? "ax-motif--compact" : "", className].filter(Boolean).join(" ")}>
      <Render />
    </div>
  );
}

/** Full-bleed hero atmosphere — blobs, arcs, soft gradients */
export function ApexHeroAtmosphere() {
  return (
    <div className="ax-hero-abstract" data-ax-visual-parallax aria-hidden>
      <div className="ax-hero-abstract__inner">
        <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" className="ax-hero-abstract__svg">
          <defs>
            <radialGradient id="ax-hero-blob-a" cx="70%" cy="35%">
              <stop offset="0%" stopColor="rgba(212, 196, 168, 0.09)" />
              <stop offset="100%" stopColor="rgba(212, 196, 168, 0)" />
            </radialGradient>
            <radialGradient id="ax-hero-blob-b" cx="30%" cy="70%">
              <stop offset="0%" stopColor="rgba(140, 130, 120, 0.06)" />
              <stop offset="100%" stopColor="rgba(140, 130, 120, 0)" />
            </radialGradient>
            <linearGradient id="ax-hero-line" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(212, 196, 168, 0)" />
              <stop offset="50%" stopColor="rgba(212, 196, 168, 0.25)" />
              <stop offset="100%" stopColor="rgba(212, 196, 168, 0)" />
            </linearGradient>
          </defs>
          <ellipse cx="980" cy="320" rx="420" ry="320" fill="url(#ax-hero-blob-a)" className="ax-hero-blob ax-hero-blob--a" />
          <ellipse cx="380" cy="620" rx="360" ry="280" fill="url(#ax-hero-blob-b)" className="ax-hero-blob ax-hero-blob--b" />
          <path
            d="M-40 680 Q480 420 920 520 T1440 380"
            stroke="url(#ax-hero-line)"
            strokeWidth="1"
            fill="none"
            className="ax-hero-flow-line"
          />
          <path
            d="M-20 720 Q520 480 960 560 T1440 420"
            stroke="rgba(212,196,168,0.08)"
            strokeWidth="0.75"
            fill="none"
            className="ax-hero-flow-line ax-hero-flow-line--delay"
          />
          <circle cx="920" cy="520" r="2" fill="rgba(212,196,168,0.4)" className="ax-motif-node" />
          <circle cx="480" cy="420" r="1.5" fill="rgba(212,196,168,0.25)" />
        </svg>
      </div>
    </div>
  );
}
