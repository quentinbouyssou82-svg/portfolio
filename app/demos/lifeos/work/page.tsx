"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Circle, Focus, Zap } from "lucide-react";
import { LifeOSStreakChip } from "@/components/lifeos/lifeos-streak-chip";

const PROJECTS = [
  {
    name: "LifeOS Launch",
    quests: [
      { id: "w1", title: "Design progression map", done: true, xp: 40 },
      { id: "w2", title: "Build home dashboard", done: true, xp: 50 },
      { id: "w3", title: "Gamification system spec", done: false, xp: 60 },
    ],
    color: "var(--lifeos-purple)",
  },
  {
    name: "Client Portfolio",
    quests: [
      { id: "w4", title: "Palan Capital review", done: true, xp: 30 },
      { id: "w5", title: "Send preview link", done: false, xp: 25 },
    ],
    color: "var(--lifeos-blue)",
  },
];

export default function LifeOSWorkPage() {
  const [focusActive, setFocusActive] = useState(false);
  const [seconds] = useState(25 * 60);

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-[var(--lifeos-border)] bg-white/90 px-4 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/demos/lifeos" className="flex items-center gap-2 text-sm font-semibold text-[var(--lifeos-muted)]">
            <ArrowLeft className="size-4" />
            Work World
          </Link>
          <LifeOSStreakChip streak={9} compact />
        </div>
      </header>

      <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
        <div className="lifeos-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--lifeos-blue)]">
                Deep work
              </p>
              <h1 className="text-xl font-bold">Focus session</h1>
            </div>
            <Focus className="size-6 text-[var(--lifeos-blue)]" />
          </div>

          <div className="mt-6 flex flex-col items-center">
            <div className="relative flex size-48 items-center justify-center">
              <svg className="absolute inset-0 size-full -rotate-90">
                <circle cx="96" cy="96" r="88" fill="none" stroke="#EDE9FE" strokeWidth="8" />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  fill="none"
                  stroke="var(--lifeos-blue)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 88}
                  strokeDashoffset={2 * Math.PI * 88 * (1 - 0.35)}
                />
              </svg>
              <div className="text-center">
                <p className="text-4xl font-extrabold tabular-nums">
                  {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
                </p>
                <p className="text-sm text-[var(--lifeos-muted)]">+80 XP on complete</p>
              </div>
            </div>

            <motion.button
              type="button"
              onClick={() => setFocusActive(!focusActive)}
              className="mt-6 rounded-2xl bg-[var(--lifeos-blue)] px-8 py-3 font-bold text-white shadow-lg"
              whileTap={{ scale: 0.98 }}
            >
              {focusActive ? "Pause" : "Start focus"}
            </motion.button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Focus streak", value: "9 days", icon: Zap },
            { label: "Quests done", value: "12", icon: Check },
            { label: "XP today", value: "+160", icon: Circle },
          ].map((stat) => (
            <div key={stat.label} className="lifeos-card p-4 text-center">
              <stat.icon className="mx-auto size-5 text-[var(--lifeos-blue)]" />
              <p className="mt-2 text-2xl font-extrabold">{stat.value}</p>
              <p className="text-xs text-[var(--lifeos-muted)]">{stat.label}</p>
            </div>
          ))}
        </div>

        {PROJECTS.map((project) => (
          <section key={project.name}>
            <div className="mb-3 flex items-center gap-2">
              <div className="size-2 rounded-full" style={{ background: project.color }} />
              <h2 className="font-bold">{project.name}</h2>
            </div>
            <div className="space-y-2">
              {project.quests.map((quest) => (
                <div
                  key={quest.id}
                  className={`lifeos-card flex items-center gap-4 p-4 ${quest.done ? "lifeos-quest-complete" : ""}`}
                >
                  <span
                    className={`flex size-8 items-center justify-center rounded-lg ${
                      quest.done ? "bg-[var(--lifeos-green)] text-white" : "border-2 border-[var(--lifeos-border)]"
                    }`}
                  >
                    {quest.done && <Check className="size-4" />}
                  </span>
                  <div className="flex-1">
                    <p className={`font-semibold ${quest.done ? "line-through text-[var(--lifeos-muted)]" : ""}`}>
                      {quest.title}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-[var(--lifeos-muted)]">+{quest.xp} XP</span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
