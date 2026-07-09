"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Dumbbell, Trophy } from "lucide-react";
import { LifeOSActivityRing } from "@/components/lifeos/lifeos-activity-rings";
import { LifeOSMapPath } from "@/components/lifeos/lifeos-map-path";
import { FITNESS_MAP_NODES } from "@/lib/lifeos/constants";
import { cn } from "@/lib/utils";

const EXERCISES = [
  { id: "e1", name: "Barbell Squat", sets: 4, reps: 8, weight: "80kg", done: true },
  { id: "e2", name: "Romanian Deadlift", sets: 4, reps: 8, weight: "70kg", done: false, active: true },
  { id: "e3", name: "Leg Press", sets: 3, reps: 12, weight: "120kg", done: false },
  { id: "e4", name: "Walking Lunges", sets: 3, reps: 10, weight: "20kg", done: false },
  { id: "e5", name: "Calf Raises", sets: 4, reps: 15, weight: "40kg", done: false },
];

const PRS = [
  { lift: "Squat", value: "120kg", trend: "+5kg" },
  { lift: "Bench", value: "100kg", trend: "PR!" },
  { lift: "Deadlift", value: "140kg", trend: "+2.5kg" },
];

export default function LifeOSFitnessPage() {
  const [exercises, setExercises] = useState(EXERCISES);
  const [view, setView] = useState<"session" | "map">("session");

  const completeSet = (id: string) => {
    setExercises((prev) => {
      const idx = prev.findIndex((e) => e.id === id);
      if (idx === -1) return prev;
      const next = [...prev];
      next[idx] = { ...next[idx], done: true, active: false };
      if (idx + 1 < next.length) next[idx + 1] = { ...next[idx + 1], active: true };
      return next;
    });
  };

  const active = exercises.find((e) => e.active);
  const progress = exercises.filter((e) => e.done).length / exercises.length;

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-[var(--lifeos-border)] bg-white/90 px-4 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/demos/lifeos" className="flex items-center gap-2 text-sm font-semibold text-[var(--lifeos-muted)]">
            <ArrowLeft className="size-4" />
            Fitness World
          </Link>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setView("session")}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold",
                view === "session" ? "bg-[var(--lifeos-orange)] text-white" : "bg-[var(--lifeos-bg)]",
              )}
            >
              Session
            </button>
            <button
              type="button"
              onClick={() => setView("map")}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold",
                view === "map" ? "bg-[var(--lifeos-orange)] text-white" : "bg-[var(--lifeos-bg)]",
              )}
            >
              Map
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-6">
        {view === "map" ? (
          <LifeOSMapPath nodes={FITNESS_MAP_NODES} worldId="fitness" />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
            <div className="space-y-6">
              <div className="lifeos-card p-6">
                <div className="flex items-center gap-2">
                  <Dumbbell className="size-5 text-[var(--lifeos-orange)]" />
                  <h1 className="text-xl font-bold">Leg Day Mission</h1>
                </div>
                <p className="mt-1 text-sm text-[var(--lifeos-muted)]">+120 XP · 45 min est.</p>
                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-xs font-semibold">
                    <span>Mission progress</span>
                    <span>{Math.round(progress * 100)}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-[var(--lifeos-bg)]">
                    <motion.div
                      className="h-full rounded-full bg-[var(--lifeos-orange)]"
                      animate={{ width: `${progress * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="lifeos-card flex justify-around p-6">
                <LifeOSActivityRing value={320} max={500} color="var(--lifeos-orange)" label="Move" size={88} />
                <LifeOSActivityRing value={4} max={5} color="var(--lifeos-gold)" label="Strength" size={88} />
                <LifeOSActivityRing value={12} max={14} color="var(--lifeos-green)" label="Streak" size={88} />
              </div>

              <div className="lifeos-card p-5">
                <div className="mb-3 flex items-center gap-2">
                  <Trophy className="size-4 text-[var(--lifeos-gold)]" />
                  <h2 className="font-bold">Personal records</h2>
                </div>
                <div className="space-y-2">
                  {PRS.map((pr) => (
                    <div key={pr.lift} className="flex items-center justify-between rounded-xl bg-[var(--lifeos-bg)] px-4 py-3">
                      <span className="font-semibold">{pr.lift}</span>
                      <div className="text-right">
                        <span className="font-bold">{pr.value}</span>
                        <span className="ml-2 text-xs font-semibold text-[var(--lifeos-green)]">{pr.trend}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {active && (
                <motion.div
                  className="lifeos-card lifeos-hero-quest p-6"
                  layout
                  key={active.id}
                >
                  <p className="text-xs font-bold uppercase tracking-wider text-[var(--lifeos-orange)]">
                    Exercise {exercises.findIndex((e) => e.id === active.id) + 1}/{exercises.length}
                  </p>
                  <h2 className="mt-2 text-2xl font-extrabold">{active.name}</h2>
                  <p className="text-[var(--lifeos-muted)]">
                    {active.sets} × {active.reps} · {active.weight}
                  </p>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--lifeos-bg)]">
                    <div className="h-full w-3/4 rounded-full bg-[var(--lifeos-orange)]" />
                  </div>
                  <p className="mt-1 text-xs text-[var(--lifeos-muted)]">Set 3 of 4</p>
                  <motion.button
                    type="button"
                    onClick={() => completeSet(active.id)}
                    className="mt-6 w-full rounded-2xl bg-[var(--lifeos-orange)] py-4 font-bold text-white shadow-lg"
                    whileTap={{ scale: 0.98 }}
                  >
                    Complete set · +15 XP
                  </motion.button>
                </motion.div>
              )}

              {exercises.map((ex) => (
                <div
                  key={ex.id}
                  className={cn(
                    "lifeos-card flex items-center gap-4 p-4",
                    ex.done && "lifeos-quest-complete",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-10 items-center justify-center rounded-xl",
                      ex.done ? "bg-[var(--lifeos-green)] text-white" : "bg-[var(--lifeos-bg)]",
                    )}
                  >
                    {ex.done ? <Check className="size-5" /> : <Dumbbell className="size-4 text-[var(--lifeos-muted)]" />}
                  </span>
                  <div className="flex-1">
                    <p className={cn("font-semibold", ex.done && "line-through text-[var(--lifeos-muted)]")}>
                      {ex.name}
                    </p>
                    <p className="text-xs text-[var(--lifeos-muted)]">
                      {ex.sets}×{ex.reps} · {ex.weight}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
