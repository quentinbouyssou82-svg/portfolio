"use client";

import {
  Crown,
  History,
  LayoutDashboard,
  ScanLine,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import { DEMO_PROFILE } from "@/lib/data";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/analyse", label: "Analyser", icon: ScanLine },
  { href: "/historique", label: "Historique", icon: History },
  { href: "/profil", label: "Profil", icon: User },
  { href: "/premium", label: "Premium", icon: Crown },
];

function NavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200",
        active
          ? "bg-accent-soft text-accent"
          : "text-muted hover:bg-white/[0.05] hover:text-foreground"
      )}
    >
      <Icon className="size-[18px]" />
      {label}
      {href === "/premium" && !active && (
        <span className="ml-auto rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold text-accent">
          Essai
        </span>
      )}
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  return (
    <div className="min-h-dvh lg:flex">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-border bg-surface/80 backdrop-blur-xl lg:flex">
        <div className="flex h-16 items-center border-b border-border px-5">
          <Link href="/" aria-label="Retour à l'accueil">
            <Logo />
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} {...item} active={isActive(item.href)} />
          ))}
        </nav>

        <div className="border-t border-border p-3">
          <Link
            href="/profil"
            className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-white/[0.05]"
          >
            <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-accent/30 to-sky-500/20 text-sm font-semibold text-accent">
              {DEMO_PROFILE.name.charAt(0)}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-foreground">
                {DEMO_PROFILE.name}
              </span>
              <span className="block text-xs text-faint">
                Plan gratuit · {DEMO_PROFILE.city}
              </span>
            </span>
          </Link>
        </div>
      </aside>

      {/* Barre mobile haute */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-xl lg:hidden">
        <Link href="/" aria-label="Retour à l'accueil">
          <Logo />
        </Link>
        <Link
          href="/profil"
          className="flex size-8 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent"
        >
          {DEMO_PROFILE.name.charAt(0)}
        </Link>
      </header>

      {/* Contenu */}
      <main className="flex-1 pt-14 pb-24 lg:ml-60 lg:pt-0 lg:pb-0">
        <div className="mx-auto max-w-5xl p-5 sm:p-8">{children}</div>
      </main>

      {/* Tab bar mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/85 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors",
                  active ? "text-accent" : "text-faint hover:text-muted"
                )}
              >
                <item.icon className="size-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
