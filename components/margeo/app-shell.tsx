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
import { Logo } from "@/components/margeo/logo";
import { PageTransition } from "@/components/margeo/page-transition";
import type { UserProfile } from "@/lib/margeo/types";
import { margeoRoutes } from "@/lib/margeo/routes";
import { cn } from "@/lib/margeo/utils";

const NAV_ITEMS = [
  { href: margeoRoutes.dashboard, label: "Dashboard", icon: LayoutDashboard },
  { href: margeoRoutes.analyse, label: "Analyser", icon: ScanLine },
  { href: margeoRoutes.historique, label: "Historique", icon: History },
  { href: margeoRoutes.profil, label: "Profil", icon: User },
  { href: margeoRoutes.premium, label: "Premium", icon: Crown },
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
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors duration-200 outline-none",
        active
          ? "bg-mg-accent-soft text-mg-accent"
          : "text-mg-muted hover:bg-white/[0.05] hover:text-mg-foreground",
      )}
    >
      <Icon className="size-[18px]" />
      {label}
      {href === margeoRoutes.premium && !active && (
        <span className="ml-auto rounded-full bg-mg-accent-soft px-2 py-0.5 text-[10px] font-semibold text-mg-accent">
          Essai
        </span>
      )}
    </Link>
  );
}

export function AppShell({
  children,
  profile,
}: {
  children: React.ReactNode;
  profile: UserProfile;
}) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === margeoRoutes.dashboard
      ? pathname === href
      : pathname.startsWith(href);

  return (
    <div className="min-h-dvh lg:flex">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-mg-border bg-mg-surface/80 backdrop-blur-xl lg:flex">
        <div className="flex h-16 items-center border-b border-mg-border px-5">
          <Link href={margeoRoutes.home} aria-label="Retour à l'accueil">
            <Logo />
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} {...item} active={isActive(item.href)} />
          ))}
        </nav>

        <div className="border-t border-mg-border p-3">
          <Link
            href={margeoRoutes.profil}
            className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-white/[0.05]"
          >
            <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-mg-accent/30 to-sky-500/20 text-sm font-semibold text-mg-accent">
              {profile.name.charAt(0)}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-mg-foreground">
                {profile.name}
              </span>
              <span className="block text-xs text-mg-faint">
                Plan {profile.premium ? "Premium" : "gratuit"} · {profile.city}
              </span>
            </span>
          </Link>
        </div>
      </aside>

      {/* Barre mobile haute */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-mg-border bg-mg-background/80 px-4 pt-[env(safe-area-inset-top)] backdrop-blur-xl lg:hidden">
        <Link href={margeoRoutes.home} aria-label="Retour à l'accueil">
          <Logo />
        </Link>
        <Link
          href={margeoRoutes.profil}
          aria-label="Mon profil"
          className="flex size-11 items-center justify-center rounded-full bg-mg-accent-soft text-sm font-semibold text-mg-accent"
        >
          {profile.name.charAt(0)}
        </Link>
      </header>

      {/* Contenu */}
      <main className="flex-1 pt-[calc(3.5rem+env(safe-area-inset-top))] pb-24 lg:ml-60 lg:pt-0 lg:pb-0">
        <div className="mx-auto max-w-5xl p-5 sm:p-8">
          <PageTransition>{children}</PageTransition>
        </div>
      </main>

      {/* Tab bar mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-mg-border bg-mg-background/85 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around px-1 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                aria-label={item.label}
                className={cn(
                  "relative flex min-h-[52px] min-w-[56px] flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] font-medium transition-colors outline-none",
                  active
                    ? "text-mg-accent"
                    : "text-mg-faint hover:text-mg-muted",
                  item.href === margeoRoutes.analyse &&
                    !active &&
                    "ring-1 ring-mg-accent/20",
                )}
              >
                {active && (
                  <span className="absolute top-1 size-1 rounded-full bg-mg-accent" />
                )}
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
