"use client";

export function LifeOSXpBar({ xp, xpToNext }: { xp: number; xpToNext: number }) {
  const pct = Math.min(100, (xp / xpToNext) * 100);

  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-[var(--lifeos-muted)]">
        <span>{xp.toLocaleString()} XP</span>
        <span>{xpToNext.toLocaleString()}</span>
      </div>
      <div className="lifeos-xp-bar">
        <div className="lifeos-xp-bar-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
