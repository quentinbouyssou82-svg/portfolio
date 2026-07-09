"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map, Plus, Scroll, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/lifeos/constants";

const icons = { home: Home, map: Map, act: Plus, quests: Scroll, profile: User };

export function LifeOSBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lifeos-bottom-nav lg:hidden" aria-label="Main navigation">
      <ul className="mx-auto flex max-w-md items-end justify-between">
        {NAV_ITEMS.map((item) => {
          const Icon = icons[item.icon];
          const active =
            item.href === "/demos/lifeos"
              ? pathname === item.href
              : pathname.startsWith(item.href);

          if (item.primary) {
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="lifeos-act-fab"
                  aria-label="Quick log"
                >
                  <Icon className="size-6" strokeWidth={2.5} />
                </Link>
              </li>
            );
          }

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-1 text-[11px] font-semibold transition",
                  active ? "text-[var(--lifeos-purple)]" : "text-[var(--lifeos-muted)]",
                )}
              >
                <Icon className="size-5" strokeWidth={active ? 2.5 : 2} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
