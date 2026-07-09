"use client";

import { useLifeOS } from "@/lib/lifeos/provider";
import { LifeOSStreakChip } from "./lifeos-streak-chip";
import { LifeOSXpBar } from "./lifeos-xp-bar";

export function LifeOSTopBar({ title }: { title?: string }) {
  const { profile } = useLifeOS();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--lifeos-border)] bg-[var(--lifeos-bg)]/90 px-4 py-4 backdrop-blur-md lg:hidden">
      <div className="flex items-center justify-between">
        <div>
          {title ? (
            <h1 className="text-lg font-bold">{title}</h1>
          ) : (
            <p className="text-lg font-bold">
              Life<span className="text-[var(--lifeos-purple)]">OS</span>
            </p>
          )}
        </div>
        <LifeOSStreakChip streak={profile.streak} compact />
      </div>
      {!title && (
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-bold text-[var(--lifeos-purple)]">Level {profile.level}</span>
            <span className="text-[var(--lifeos-muted)]">{profile.title}</span>
          </div>
          <LifeOSXpBar xp={profile.xp} xpToNext={profile.xpToNextLevel} />
        </div>
      )}
    </header>
  );
}
