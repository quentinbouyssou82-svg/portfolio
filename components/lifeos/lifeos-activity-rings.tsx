"use client";

interface RingProps {
  value: number;
  max: number;
  color: string;
  label: string;
  size?: number;
}

export function LifeOSActivityRing({
  value,
  max,
  color,
  label,
  size = 72,
}: RingProps) {
  const r = (size - 12) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, value / max);
  const offset = c * (1 - pct);

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="block">
        <circle className="lifeos-ring-track" cx={size / 2} cy={size / 2} r={r} />
        <circle
          className="lifeos-ring-fill"
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="text-[10px] font-semibold text-[var(--lifeos-muted)]">{label}</span>
    </div>
  );
}

export function LifeOSActivityRings() {
  return (
    <div className="flex justify-around">
      <LifeOSActivityRing value={680} max={800} color="var(--lifeos-orange)" label="Move" />
      <LifeOSActivityRing value={42} max={60} color="var(--lifeos-green)" label="Growth" />
      <LifeOSActivityRing value={3} max={5} color="var(--lifeos-blue)" label="Focus" />
    </div>
  );
}
