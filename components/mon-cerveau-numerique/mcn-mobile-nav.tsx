"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MCN_BASE, MCN_PATHS } from "@/lib/mon-cerveau-numerique/constants";
import { navItems } from "@/lib/mon-cerveau-numerique/content";
import { cn } from "@/lib/utils";

export function McnMobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--mcn-border)] bg-[var(--mcn-bg-elevated)]/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-stretch justify-around px-1 py-1.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const full = href === "dashboard" ? MCN_PATHS.dashboard : `${MCN_BASE}/dashboard/${href}`;
          const active = pathname === full;

          return (
            <Link
              key={href}
              href={full}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[10px] transition-colors",
                active
                  ? "text-[var(--mcn-accent)]"
                  : "text-[var(--mcn-fg-subtle)] hover:text-[var(--mcn-fg-muted)]",
              )}
            >
              <Icon className="size-4" strokeWidth={active ? 2.25 : 2} />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
