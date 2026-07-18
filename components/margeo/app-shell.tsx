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
import { getProfileInitials } from "@/lib/margeo/profile-display";
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

function AvatarBubble({
  profile,
  className,
}: {
  profile: UserProfile;
  className?: string;
}) {
  const initial = getProfileInitials(profile);

  return (
    <span
      className={cn(
        "flex items-center justify-center overflow-hidden rounded-full bg-mg-accent-soft text-sm font-semibold text-mg-accent",
        className,
      )}
    >
      {profile.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={profile.avatarUrl} alt="" className="size-full object-cover" />
      ) : (
        initial
      )}
    </span>
  );
}

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
        "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-mg-accent/40",
        active
          ? "bg-mg-accent-soft text-mg-accent"
          : "text-mg-muted hover:bg-[var(--mg-nav-hover)] hover:text-mg-foreground",
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

  const displayName =
    profile.name ||
    [profile.firstName, profile.lastName].filter(Boolean).join(" ") ||
    "Livreur";

  return (
    <div className="min-h-dvh overflow-x-clip lg:flex">
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
            className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-[var(--mg-nav-hover)]"
          >
            <AvatarBubble profile={profile} className="size-9" />
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-mg-foreground">
                {displayName}
              </span>
              <span className="block text-xs text-mg-faint">
                Plan {profile.premium ? "Premium" : "gratuit"}
                {profile.city ? ` · ${profile.city}` : ""}
              </span>
            </span>
          </Link>
        </div>
      </aside>

      <header className="fixed inset-x-0 top-0 z-40 border-b border-mg-border bg-mg-background/85 backdrop-blur-xl lg:hidden pt-[env(safe-area-inset-top,0px)]">
        <div className="flex h-14 items-center justify-between px-4">
          <Link href={margeoRoutes.home} aria-label="Retour à l'accueil">
            <Logo />
          </Link>
          <Link
            href={margeoRoutes.profil}
            aria-label="Mon profil"
            className="flex size-11 items-center justify-center"
          >
            <AvatarBubble profile={profile} className="size-9" />
          </Link>
        </div>
      </header>

      <main className="flex-1 pt-[calc(3.5rem+env(safe-area-inset-top,0px))] pb-[calc(5.75rem+env(safe-area-inset-bottom,0px))] lg:ml-60 lg:pt-0 lg:pb-0">
        <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
          <PageTransition>{children}</PageTransition>
        </div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-mg-border bg-mg-background/92 backdrop-blur-xl lg:hidden pb-[env(safe-area-inset-bottom,0px)]">
        <div className="mx-auto flex max-w-md items-stretch justify-around px-0.5 pt-1.5 pb-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                aria-label={item.label}
                className={cn(
                  "relative flex min-h-[52px] min-w-[3.25rem] flex-1 max-w-[4.5rem] flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1 text-[10px] font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-mg-accent/40",
                  active ? "text-mg-accent" : "text-mg-faint",
                  item.href === margeoRoutes.analyse &&
                    !active &&
                    "text-mg-muted",
                )}
              >
                {active && (
                  <span className="absolute top-0.5 size-1 rounded-full bg-mg-accent" />
                )}
                <item.icon
                  className="size-[1.35rem]"
                  strokeWidth={active ? 2.25 : 1.75}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
