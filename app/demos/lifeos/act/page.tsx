"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen,
  Dumbbell,
  Footprints,
  Music,
  Salad,
  Sparkles,
  Timer,
} from "lucide-react";
import { LifeOSTopBar } from "@/components/lifeos/lifeos-top-bar";

const ACTIONS = [
  { href: "/demos/lifeos/fitness", label: "Workout", icon: Dumbbell, color: "var(--lifeos-orange)", xp: "50–150" },
  { href: "/demos/lifeos/nutrition", label: "Meal", icon: Salad, color: "var(--lifeos-green)", xp: "15–30" },
  { href: "/demos/lifeos/work", label: "Focus", icon: Timer, color: "var(--lifeos-blue)", xp: "40–80" },
  { href: "/demos/lifeos/learn", label: "Practice", icon: Music, color: "var(--lifeos-pink)", xp: "30–100" },
  { href: "/demos/lifeos/map", label: "Walk", icon: Footprints, color: "var(--lifeos-gold)", xp: "25–40" },
  { href: "/demos/lifeos/quests", label: "Read", icon: BookOpen, color: "var(--lifeos-purple)", xp: "20–50" },
];

export default function LifeOSActPage() {
  return (
    <>
      <LifeOSTopBar title="Quick log" />

      <div className="mx-auto max-w-lg px-4 py-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl lifeos-gradient-purple text-white">
            <Sparkles className="size-8" />
          </div>
          <h2 className="text-2xl font-extrabold">What did you do?</h2>
          <p className="mt-2 text-[var(--lifeos-muted)]">
            Log any activity and earn XP instantly.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {ACTIONS.map((action, i) => (
            <Link key={action.label} href={action.href}>
              <motion.div
                className="lifeos-card flex flex-col items-center gap-3 p-6 text-center"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileTap={{ scale: 0.96 }}
              >
                <div
                  className="flex size-14 items-center justify-center rounded-2xl"
                  style={{ background: `${action.color}22`, color: action.color }}
                >
                  <action.icon className="size-7" />
                </div>
                <div>
                  <p className="font-bold">{action.label}</p>
                  <p className="text-xs text-[var(--lifeos-muted)]">+{action.xp} XP</p>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
