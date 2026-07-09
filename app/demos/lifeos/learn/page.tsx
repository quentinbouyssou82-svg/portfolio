"use client";

import Link from "next/link";
import { LifeOSMapPath } from "@/components/lifeos/lifeos-map-path";
import { PIANO_MAP_NODES } from "@/lib/lifeos/constants";

export default function LifeOSLearnPage() {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-[var(--lifeos-border)] bg-white/90 px-4 py-4 backdrop-blur-md">
        <Link href="/demos/lifeos" className="flex items-center gap-2 text-sm font-semibold text-[var(--lifeos-muted)]">
          ← Learning · Piano World
        </Link>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="lifeos-card-hero mb-6 p-6">
          <p className="text-3xl">🎹</p>
          <h1 className="mt-2 text-2xl font-extrabold">Piano World</h1>
          <p className="text-[var(--lifeos-muted)]">
            Level 7 · Chord transitions — your next mission
          </p>
          <Link
            href="/demos/lifeos/quests"
            className="mt-4 inline-flex rounded-2xl bg-[var(--lifeos-pink)] px-6 py-3 text-sm font-bold text-white shadow-lg"
          >
            Start 25 min practice · +50 XP
          </Link>
        </div>

        <LifeOSMapPath nodes={PIANO_MAP_NODES} worldId="piano" />

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="lifeos-card p-5">
            <p className="text-sm font-semibold text-[var(--lifeos-muted)]">Reading World</p>
            <p className="mt-1 text-xl font-bold">Level 11</p>
            <p className="mt-2 text-sm text-[var(--lifeos-muted)]">3 chapters this week</p>
          </div>
          <div className="lifeos-card p-5">
            <p className="text-sm font-semibold text-[var(--lifeos-muted)]">Courses</p>
            <p className="mt-1 text-xl font-bold">Design Systems</p>
            <p className="mt-2 text-sm text-[var(--lifeos-muted)]">Module 4 of 12</p>
          </div>
        </div>
      </div>
    </div>
  );
}
