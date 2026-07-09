"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { LifeOSActivityRings } from "@/components/lifeos/lifeos-activity-rings";
import { LifeOSCoachPanel } from "@/components/lifeos/lifeos-coach-panel";
import { LifeOSQuestRow } from "@/components/lifeos/lifeos-quest-row";
import { LifeOSStreakHero } from "@/components/lifeos/lifeos-streak-hero";
import { LifeOSTopBar } from "@/components/lifeos/lifeos-top-bar";
import { LifeOSWorldCard } from "@/components/lifeos/lifeos-world-card";
import { WORLDS } from "@/lib/lifeos/constants";
import { useLifeOS } from "@/lib/lifeos/provider";

export default function LifeOSHomePage() {
  const { profile, quests, completeQuest, weeklyProgress } = useLifeOS();
  const dailyQuests = quests.filter((q) => q.period === "daily");
  const nextQuest = dailyQuests.find((q) => q.status === "pending");
  const weeklyDone = quests.filter((q) => q.period === "weekly" && q.status === "complete").length;
  const weeklyTotal = quests.filter((q) => q.period === "weekly").length;

  return (
    <>
      <LifeOSTopBar />

      <div className="mx-auto max-w-2xl space-y-6 px-4 py-6 lg:max-w-4xl lg:px-8 lg:py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="hidden lg:block"
        >
          <h1 className="text-3xl font-extrabold tracking-tight">
            Good morning, {profile.name}.
          </h1>
          <p className="mt-1 text-[var(--lifeos-muted)]">
            What should you do next? Start with your hero quest.
          </p>
        </motion.div>

        <LifeOSStreakHero />

        {nextQuest && (
          <Link href="/demos/lifeos/quests" className="block">
            <motion.div
              className="lifeos-gradient-purple flex items-center justify-between rounded-2xl p-4 text-white shadow-lg"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider opacity-80">
                  Start next
                </p>
                <p className="mt-1 font-bold">{nextQuest.title}</p>
                <p className="text-sm opacity-80">+{nextQuest.xp} XP</p>
              </div>
              <ArrowRight className="size-6" />
            </motion.div>
          </Link>
        )}

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--lifeos-muted)]">
              Today&apos;s quests
            </h2>
            <Link href="/demos/lifeos/quests" className="text-sm font-semibold text-[var(--lifeos-purple)]">
              See all
            </Link>
          </div>
          <div className="space-y-3">
            {dailyQuests.map((q) => (
              <LifeOSQuestRow key={q.id} quest={q} onComplete={completeQuest} />
            ))}
          </div>
        </section>

        <section className="lifeos-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold">This week</h2>
            <span className="text-sm font-semibold text-[var(--lifeos-purple)]">
              {weeklyDone}/{weeklyTotal} quests
            </span>
          </div>
          <div className="flex gap-2">
            {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
              <div key={`${day}-${i}`} className="flex-1 text-center">
                <div className="mx-auto mb-1 h-16 overflow-hidden rounded-xl bg-[var(--lifeos-bg)]">
                  <motion.div
                    className="w-full rounded-xl bg-[var(--lifeos-green)]"
                    initial={{ height: 0 }}
                    animate={{ height: `${weeklyProgress[i] * 100}%` }}
                    transition={{ delay: i * 0.08, duration: 0.5 }}
                    style={{ marginTop: `${(1 - weeklyProgress[i]) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-semibold text-[var(--lifeos-muted)]">{day}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-xs text-[var(--lifeos-muted)]">
            Weekly chest unlocks at 80% — you&apos;re at 72%
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-[var(--lifeos-muted)]">
            Your worlds
          </h2>
          <div className="lifeos-scroll-hide -mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
            {WORLDS.map((w) => (
              <LifeOSWorldCard key={w.id} world={w} />
            ))}
          </div>
        </section>

        <section className="lifeos-card p-5">
          <h2 className="mb-4 font-bold">Activity summary</h2>
          <LifeOSActivityRings />
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              { label: "Fitness", xp: 120, color: "var(--lifeos-orange)" },
              { label: "Nutrition", xp: 45, color: "var(--lifeos-green)" },
              { label: "Work", xp: 80, color: "var(--lifeos-blue)" },
              { label: "Piano", xp: 50, color: "var(--lifeos-pink)" },
            ].map((item) => (
              <span
                key={item.label}
                className="rounded-full px-3 py-1 text-xs font-semibold"
                style={{ background: `${item.color}22`, color: item.color }}
              >
                {item.label} +{item.xp} XP
              </span>
            ))}
          </div>
        </section>

        <section className="lg:hidden">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="size-4 text-[var(--lifeos-purple)]" />
            <h2 className="font-bold">Coach</h2>
          </div>
          <LifeOSCoachPanel compact />
        </section>
      </div>
    </>
  );
}
