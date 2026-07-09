"use client";

import { useState } from "react";
import { LifeOSMapPath } from "@/components/lifeos/lifeos-map-path";
import { LifeOSTopBar } from "@/components/lifeos/lifeos-top-bar";
import { FITNESS_MAP_NODES, PIANO_MAP_NODES, WORLDS } from "@/lib/lifeos/constants";
import { cn } from "@/lib/utils";

const MAP_WORLDS = [
  { id: "piano", nodes: PIANO_MAP_NODES },
  { id: "fitness", nodes: FITNESS_MAP_NODES },
];

export default function LifeOSMapPage() {
  const [activeWorld, setActiveWorld] = useState("piano");
  const current = MAP_WORLDS.find((w) => w.id === activeWorld) ?? MAP_WORLDS[0];

  return (
    <>
      <LifeOSTopBar title="Progression Map" />

      <div className="mx-auto max-w-2xl px-4 py-6 lg:max-w-4xl lg:px-8">
        <p className="mb-6 hidden text-[var(--lifeos-muted)] lg:block">
          Travel through your life worlds. Tap nodes to start missions.
        </p>

        <div className="lifeos-scroll-hide -mx-4 mb-6 flex gap-2 overflow-x-auto px-4">
          {WORLDS.map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() => MAP_WORLDS.some((m) => m.id === w.id) && setActiveWorld(w.id)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition",
                activeWorld === w.id
                  ? "text-white shadow-md"
                  : "bg-white text-[var(--lifeos-muted)] border border-[var(--lifeos-border)]",
              )}
              style={
                activeWorld === w.id ? { background: w.color } : undefined
              }
            >
              {w.emoji} {w.name}
            </button>
          ))}
        </div>

        <div className="lifeos-card overflow-hidden">
          <LifeOSMapPath nodes={current.nodes} worldId={current.id} />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {WORLDS.slice(0, 4).map((w) => (
            <div key={w.id} className="lifeos-card flex items-center gap-4 p-4">
              <span className="text-3xl">{w.emoji}</span>
              <div>
                <p className="font-bold">{w.name}</p>
                <p className="text-sm text-[var(--lifeos-muted)]">
                  Lv.{w.level} · {w.progress}% to next
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
