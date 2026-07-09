"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Dumbbell,
  Home,
  Map,
  Plus,
  Salad,
  Scroll,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLifeOS } from "@/lib/lifeos/provider";
import { LifeOSXpBar } from "./lifeos-xp-bar";
import { LifeOSStreakChip } from "./lifeos-streak-chip";

const mainNav = [
  { href: "/demos/lifeos", label: "Home", icon: Home },
  { href: "/demos/lifeos/map", label: "Map", icon: Map },
  { href: "/demos/lifeos/quests", label: "Quests", icon: Scroll },
  { href: "/demos/lifeos/profile", label: "Profile", icon: User },
];

const worldNav = [
  { href: "/demos/lifeos/fitness", label: "Fitness", icon: Dumbbell, color: "var(--lifeos-orange)" },
  { href: "/demos/lifeos/nutrition", label: "Nutrition", icon: Salad, color: "var(--lifeos-green)" },
  { href: "/demos/lifeos/work", label: "Work", icon: BookOpen, color: "var(--lifeos-blue)" },
  { href: "/demos/lifeos/learn", label: "Learn", icon: BookOpen, color: "var(--lifeos-pink)" },
];

export function LifeOSSidebar() {
  const pathname = usePathname();
  const { profile } = useLifeOS();

  return (
    <aside className="hidden border-r border-[var(--lifeos-border)] bg-white px-4 py-6 lg:block">
      <Link href="/demos/lifeos" className="flex items-center gap-2 px-2">
        <span className="flex size-9 items-center justify-center rounded-xl lifeos-gradient-purple text-sm font-bold text-white">
          L
        </span>
        <span className="text-lg font-bold tracking-tight">LifeOS</span>
      </Link>

      <div className="mt-6 space-y-3 px-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-[var(--lifeos-purple)]">Lv.{profile.level}</span>
          <LifeOSStreakChip streak={profile.streak} compact />
        </div>
        <LifeOSXpBar xp={profile.xp} xpToNext={profile.xpToNextLevel} />
      </div>

      <nav className="mt-8 space-y-1">
        {mainNav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-[var(--lifeos-purple-soft)] text-[var(--lifeos-purple)]"
                  : "text-[var(--lifeos-muted)] hover:bg-[var(--lifeos-bg)] hover:text-[var(--lifeos-text)]",
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <p className="mt-8 px-3 text-xs font-semibold uppercase tracking-wider text-[var(--lifeos-muted)]">
        Worlds
      </p>
      <nav className="mt-2 space-y-1">
        {worldNav.map(({ href, label, icon: Icon, color }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-[var(--lifeos-bg)] text-[var(--lifeos-text)]"
                  : "text-[var(--lifeos-muted)] hover:bg-[var(--lifeos-bg)]",
              )}
            >
              <Icon className="size-4" style={{ color }} />
              {label}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/demos/lifeos/act"
        className="mt-8 flex items-center justify-center gap-2 rounded-2xl lifeos-gradient-streak px-4 py-3 text-sm font-semibold text-white shadow-lg"
      >
        <Plus className="size-4" />
        Quick log
      </Link>
    </aside>
  );
}
