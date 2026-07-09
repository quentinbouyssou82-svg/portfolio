"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Droplets, Plus } from "lucide-react";
import { LifeOSActivityRing } from "@/components/lifeos/lifeos-activity-rings";

const MACROS = [
  { label: "Calories", value: 1840, max: 2200, color: "var(--lifeos-orange)", unit: "kcal" },
  { label: "Protein", value: 128, max: 160, color: "var(--lifeos-green)", unit: "g" },
  { label: "Carbs", value: 180, max: 250, color: "var(--lifeos-blue)", unit: "g" },
  { label: "Fat", value: 58, max: 70, color: "var(--lifeos-gold)", unit: "g" },
];

const MEALS = [
  { name: "Breakfast", items: "Oats, banana, protein shake", logged: true, xp: 25 },
  { name: "Lunch", items: "Not logged yet", logged: false, xp: 30 },
  { name: "Dinner", items: "Planned: salmon & rice", logged: false, xp: 25 },
  { name: "Snacks", items: "Greek yogurt", logged: true, xp: 15 },
];

export default function LifeOSNutritionPage() {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-[var(--lifeos-border)] bg-white/90 px-4 py-4 backdrop-blur-md">
        <Link href="/demos/lifeos" className="flex items-center gap-2 text-sm font-semibold text-[var(--lifeos-muted)]">
          <ArrowLeft className="size-4" />
          Nutrition World
        </Link>
      </header>

      <div className="mx-auto max-w-2xl space-y-6 px-4 py-6 lg:max-w-4xl">
        <div className="lifeos-card-hero p-6 text-center">
          <p className="text-sm font-semibold text-[var(--lifeos-muted)]">Nutrition score</p>
          <p className="mt-1 text-5xl font-extrabold text-[var(--lifeos-green)]">82</p>
          <p className="mt-2 text-sm text-[var(--lifeos-muted)]">
            Consistency score: 7-day avg · 78
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {MACROS.map((macro, i) => (
            <motion.div
              key={macro.label}
              className="lifeos-card flex flex-col items-center p-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
            >
              <LifeOSActivityRing
                value={macro.value}
                max={macro.max}
                color={macro.color}
                label={macro.label}
                size={80}
              />
              <p className="mt-2 text-lg font-bold">
                {macro.value}
                <span className="text-xs font-normal text-[var(--lifeos-muted)]">/{macro.max}</span>
              </p>
              <p className="text-[10px] text-[var(--lifeos-muted)]">{macro.unit}</p>
            </motion.div>
          ))}
        </div>

        <div className="lifeos-card flex items-center gap-4 p-5">
          <LifeOSActivityRing value={6} max={8} color="var(--lifeos-blue)" label="Hydration" size={72} />
          <div className="flex-1">
            <p className="font-bold">Hydration</p>
            <p className="text-sm text-[var(--lifeos-muted)]">6 of 8 glasses · 1.5L</p>
          </div>
          <button
            type="button"
            className="flex size-12 items-center justify-center rounded-2xl bg-[var(--lifeos-blue)] text-white"
          >
            <Droplets className="size-5" />
          </button>
        </div>

        <section>
          <h2 className="mb-3 font-bold">Today&apos;s meals</h2>
          <div className="space-y-3">
            {MEALS.map((meal) => (
              <div
                key={meal.name}
                className={`lifeos-card flex items-center gap-4 p-4 ${meal.logged ? "lifeos-quest-complete" : ""}`}
              >
                <span className="text-2xl">🥗</span>
                <div className="flex-1">
                  <p className="font-semibold">{meal.name}</p>
                  <p className="text-sm text-[var(--lifeos-muted)]">{meal.items}</p>
                </div>
                {!meal.logged ? (
                  <button
                    type="button"
                    className="flex items-center gap-1 rounded-xl bg-[var(--lifeos-green)] px-3 py-2 text-xs font-bold text-white"
                  >
                    <Plus className="size-3" />
                    Log · +{meal.xp} XP
                  </button>
                ) : (
                  <span className="text-xs font-semibold text-[var(--lifeos-green)]">+{meal.xp} XP</span>
                )}
              </div>
            ))}
          </div>
        </section>

        <div className="lifeos-card p-5">
          <h2 className="mb-4 font-bold">7-day rings</h2>
          <div className="flex justify-between gap-1">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <div key={`${d}-${i}`} className="flex flex-col items-center gap-1">
                <LifeOSActivityRing
                  value={[1, 0.9, 1, 0.7, 1, 0.85, 0.5][i] * 100}
                  max={100}
                  color="var(--lifeos-green)"
                  label=""
                  size={40}
                />
                <span className="text-[9px] font-semibold text-[var(--lifeos-muted)]">{d}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
