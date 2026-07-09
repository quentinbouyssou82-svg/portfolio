"use client";

import { LifeOSQuestRow } from "@/components/lifeos/lifeos-quest-row";
import { LifeOSTopBar } from "@/components/lifeos/lifeos-top-bar";
import { useLifeOS } from "@/lib/lifeos/provider";

export default function LifeOSQuestsPage() {
  const { quests, completeQuest } = useLifeOS();

  const daily = quests.filter((q) => q.period === "daily");
  const weekly = quests.filter((q) => q.period === "weekly");
  const dailyDone = daily.filter((q) => q.status === "complete").length;

  return (
    <>
      <LifeOSTopBar title="Quests" />

      <div className="mx-auto max-w-2xl space-y-8 px-4 py-6 lg:max-w-4xl lg:px-8">
        <div className="lifeos-card-hero p-6 text-center">
          <p className="text-sm font-semibold text-[var(--lifeos-muted)]">Daily progress</p>
          <p className="mt-1 text-4xl font-extrabold text-[var(--lifeos-purple)]">
            {dailyDone}/{daily.length}
          </p>
          <p className="mt-2 text-sm text-[var(--lifeos-muted)]">
            Complete all dailies to unlock today&apos;s chest
          </p>
        </div>

        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-[var(--lifeos-muted)]">
            Daily quests
          </h2>
          <div className="space-y-3">
            {daily.map((q) => (
              <LifeOSQuestRow key={q.id} quest={q} onComplete={completeQuest} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-[var(--lifeos-muted)]">
            Weekly quests
          </h2>
          <div className="space-y-3">
            {weekly.map((q) => (
              <LifeOSQuestRow key={q.id} quest={q} onComplete={completeQuest} />
            ))}
          </div>
        </section>

        <section className="lifeos-gradient-level rounded-3xl p-6 text-center text-white">
          <p className="text-sm font-semibold uppercase tracking-wider opacity-90">
            Monthly challenge
          </p>
          <p className="mt-2 text-xl font-bold">30-Day Consistency Run</p>
          <p className="mt-1 text-sm opacity-90">Complete 25 days · Reward: Legendary badge</p>
          <div className="mx-auto mt-4 h-2 max-w-xs overflow-hidden rounded-full bg-white/30">
            <div className="h-full w-[60%] rounded-full bg-white" />
          </div>
        </section>
      </div>
    </>
  );
}
