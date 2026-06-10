"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Settings } from "lucide-react";
import { McnLogo } from "@/components/mon-cerveau-numerique/mcn-logo";
import { McnSeparator } from "@/components/mon-cerveau-numerique/ui/separator";
import { useMcnStore } from "@/hooks/use-mcn-store";
import { MCN_BASE, MCN_PATHS } from "@/lib/mon-cerveau-numerique/constants";
import { navItems } from "@/lib/mon-cerveau-numerique/content";
import { cn } from "@/lib/utils";

export function McnSidebar() {
  const pathname = usePathname();
  const { data, ready } = useMcnStore();

  function isActive(href: string) {
    const full = href === "dashboard" ? MCN_PATHS.dashboard : `${MCN_BASE}/dashboard/${href}`;
    if (href === "dashboard") return pathname === full;
    return pathname === full || pathname.startsWith(`${full}/`);
  }

  return (
    <aside
      className="hidden min-h-screen w-[var(--mcn-sidebar-width)] shrink-0 flex-col border-r border-[var(--mcn-border)] bg-[var(--mcn-bg-elevated)] md:flex"
    >
      <div className="p-4">
        <Link href={MCN_PATHS.dashboard} className="block transition-opacity hover:opacity-80">
          <McnLogo showLabel />
        </Link>
        {ready ? (
          <p className="mt-3 truncate rounded-md border border-[var(--mcn-border)] bg-[var(--mcn-surface)] px-2.5 py-1.5 text-xs text-[var(--mcn-fg-muted)]">
            {data.profile.display_name ?? "Démo"}
          </p>
        ) : (
          <div className="mt-3 h-8 animate-pulse rounded-md bg-[var(--mcn-surface-hover)]" />
        )}
      </div>

      <McnSeparator />

      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          const link =
            href === "dashboard" ? MCN_PATHS.dashboard : `${MCN_BASE}/dashboard/${href}`;

          return (
            <Link
              key={href}
              href={link}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-all duration-200",
                active
                  ? "bg-[var(--mcn-surface-hover)] font-medium text-[var(--mcn-fg)]"
                  : "text-[var(--mcn-fg-muted)] hover:bg-[var(--mcn-surface)] hover:text-[var(--mcn-fg)]",
              )}
            >
              <Icon
                className={cn("size-4 shrink-0", active ? "text-[var(--mcn-accent)]" : "")}
                strokeWidth={active ? 2.25 : 2}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3">
        <McnSeparator className="mb-3" />
        <Link
          href={MCN_PATHS.settings}
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
            pathname === MCN_PATHS.settings
              ? "bg-[var(--mcn-surface-hover)] font-medium text-[var(--mcn-fg)]"
              : "text-[var(--mcn-fg-muted)] hover:bg-[var(--mcn-surface)] hover:text-[var(--mcn-fg)]",
          )}
        >
          <Settings className="size-4" />
          Paramètres
        </Link>
        <Link
          href={MCN_PATHS.login}
          className="mt-0.5 flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-[var(--mcn-fg-muted)] transition-colors hover:bg-[var(--mcn-surface)] hover:text-[var(--mcn-fg)]"
        >
          <LogOut className="size-4" />
          Déconnexion
        </Link>
      </div>
    </aside>
  );
}
