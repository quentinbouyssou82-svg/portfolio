"use client";

import { motion } from "framer-motion";
import { Coins, Flame, Shield } from "lucide-react";
import { LifeOSTopBar } from "@/components/lifeos/lifeos-top-bar";
import { LifeOSXpBar } from "@/components/lifeos/lifeos-xp-bar";
import { ACHIEVEMENTS } from "@/lib/lifeos/constants";
import { useLifeOS } from "@/lib/lifeos/provider";
import { cn } from "@/lib/utils";

export default function LifeOSProfilePage() {
  const { profile } = useLifeOS();

  return (
    <>
      <LifeOSTopBar title="Profile" />

      <div className="mx-auto max-w-2xl space-y-6 px-4 py-6 lg:max-w-4xl lg:px-8">
        <div className="lifeos-card-hero flex flex-col items-center p-8 text-center">
          <div className="flex size-24 items-center justify-center rounded-full lifeos-gradient-purple text-3xl font-extrabold text-white shadow-xl">
            {profile.name[0]}
          </div>
          <h1 className="mt-4 text-2xl font-extrabold">{profile.name}</h1>
          <p className="text-[var(--lifeos-purple)] font-semibold">{profile.title}</p>
          <p className="mt-1 text-sm text-[var(--lifeos-muted)]">Life Level {profile.level}</p>
          <div className="mt-4 w-full max-w-xs">
            <LifeOSXpBar xp={profile.xp} xpToNext={profile.xpToNextLevel} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Flame, label: "Streak", value: `${profile.streak}d`, color: "var(--lifeos-orange)" },
            { icon: Shield, label: "Freezes", value: String(profile.streakFreezes), color: "var(--lifeos-blue)" },
            { icon: Coins, label: "Coins", value: String(profile.coins), color: "var(--lifeos-gold)" },
          ].map((stat) => (
            <div key={stat.label} className="lifeos-card p-4 text-center">
              <stat.icon className="mx-auto size-5" style={{ color: stat.color }} />
              <p className="mt-2 text-xl font-extrabold">{stat.value}</p>
              <p className="text-xs text-[var(--lifeos-muted)]">{stat.label}</p>
            </div>
          ))}
        </div>

        <section>
          <h2 className="mb-3 font-bold">Achievements</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {ACHIEVEMENTS.map((a, i) => (
              <motion.div
                key={a.id}
                className={cn(
                  "lifeos-card p-4 text-center",
                  !a.unlocked && "opacity-50 grayscale",
                )}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <span className="text-3xl">{a.emoji}</span>
                <p className="mt-2 text-sm font-bold">{a.title}</p>
                <p className="text-[10px] uppercase tracking-wider text-[var(--lifeos-muted)]">
                  {a.tier}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="lifeos-card p-5">
          <h2 className="mb-4 font-bold">Flame evolution</h2>
          <div className="flex justify-between">
            {["Spark", "Blaze", "Inferno", "Legendary", "Mythic"].map((tier, i) => (
              <div key={tier} className="flex flex-col items-center gap-1">
                <Flame
                  className={cn(
                    "size-8",
                    i <= 3 ? "fill-[var(--lifeos-orange)] text-[var(--lifeos-orange)]" : "text-[var(--lifeos-border)]",
                  )}
                />
                <span className="text-[9px] font-semibold text-[var(--lifeos-muted)]">{tier}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-sm text-[var(--lifeos-muted)]">
            You&apos;re at <strong className="text-[var(--lifeos-orange)]">Legendary</strong> — 53 days to Mythic
          </p>
        </section>
      </div>
    </>
  );
}
