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
import { ProfileProvider } from "@/components/margeo/profile-context";
import { getProfileInitials } from "@/lib/margeo/profile-display";
import type { UserProfile } from "@/lib/margeo/types";
import { getAppFeatures } from "@/lib/margeo/config";
import { margeoRoutes } from "@/lib/margeo/routes";
import { cn } from "@/lib/margeo/utils";

function getNavItems() {
  const inBeta = getAppFeatures().showBetaBadge;

  return {
    mobile: [
      { href: margeoRoutes.dashboard, label: "Accueil", icon: LayoutDashboard },
      { href: margeoRoutes.analyse, label: "Analyser", icon: ScanLine },
      { href: margeoRoutes.historique, label: "Histo", icon: History },
      { href: margeoRoutes.profil, label: "Profil", icon: User },
      {
        href: inBeta ? margeoRoutes.retour : `${margeoRoutes.premium}?source=nav`,
        label: inBeta ? "Retour" : "Plans",
        icon: Crown,
        match: inBeta ? margeoRoutes.retour : margeoRoutes.premium,
      },
    ],
    desktop: [
      { href: margeoRoutes.dashboard, label: "Dashboard", icon: LayoutDashboard },
      { href: margeoRoutes.analyse, label: "Analyser", icon: ScanLine },
      { href: margeoRoutes.historique, label: "Historique", icon: History },
      { href: margeoRoutes.profil, label: "Profil", icon: User },
      {
        href: inBeta ? margeoRoutes.retour : `${margeoRoutes.premium}?source=nav`,
        label: inBeta ? "Retour" : "Offres",
        icon: Crown,
        match: inBeta ? margeoRoutes.retour : margeoRoutes.premium,
      },
    ],
  };
}

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
  match,
}: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  active: boolean;
  match?: string;
}) {
  const showPlansBadge =
    (match ?? href.split("?")[0]) === margeoRoutes.premium && !active;

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
      {showPlansBadge && (
        <span className="ml-auto rounded-full bg-mg-accent-soft px-2 py-0.5 text-[10px] font-semibold text-mg-accent">
          Pro
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
  const isActive = (href: string, match?: string) => {
    const base = match ?? href.split("?")[0];
    return base === margeoRoutes.dashboard
      ? pathname === base
      : pathname.startsWith(base);
  };

  const displayName =
    profile.name ||
    [profile.firstName, profile.lastName].filter(Boolean).join(" ") ||
    "Livreur";

  const { mobile: navItems, desktop: navItemsDesktop } = getNavItems();
  const showBetaBadge = getAppFeatures().showBetaBadge;

  return (
    <ProfileProvider profile={profile}>
      <div className="min-h-dvh overflow-x-clip lg:flex">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-mg-border bg-mg-surface/80 backdrop-blur-xl lg:flex">
        <div className="flex h-16 items-center justify-between gap-2 border-b border-mg-border px-5">
          <Link href={margeoRoutes.home} aria-label="Retour à l'accueil">
            <Logo />
          </Link>
          {showBetaBadge ? (
            <span className="rounded-full border border-mg-accent/30 bg-mg-accent-soft px-2 py-0.5 text-[10px] font-semibold tracking-wide text-mg-accent uppercase">
              Bêta
            </span>
          ) : null}
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItemsDesktop.map((item) => (
            <NavLink
              key={item.href}
              {...item}
              active={isActive(item.href, item.match)}
            />
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
                Plan{" "}
                {profile.planId === "elite"
                  ? "Elite"
                  : profile.planId === "pro" || profile.premium
                    ? "Pro"
                    : "Découverte"}
                {profile.city ? ` · ${profile.city}` : ""}
              </span>
            </span>
          </Link>
          <Link
            href={margeoRoutes.retour}
            className="mt-1 flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-medium text-mg-muted transition-colors hover:bg-[var(--mg-nav-hover)] hover:text-mg-accent"
          >
            <span className="size-1.5 rounded-full bg-mg-go shadow-[0_0_0_3px_rgba(52,211,153,0.2)]" />
            Retour
          </Link>
          <nav
            aria-label="Informations légales"
            className="mt-1 flex flex-wrap gap-x-2.5 gap-y-1 px-2.5 pb-1"
          >
            <Link
              href={margeoRoutes.mentionsLegales}
              className="text-[10px] text-mg-faint transition-colors hover:text-mg-muted"
            >
              Mentions
            </Link>
            <Link
              href={margeoRoutes.confidentialite}
              className="text-[10px] text-mg-faint transition-colors hover:text-mg-muted"
            >
              Confidentialité
            </Link>
            <Link
              href={margeoRoutes.cgu}
              className="text-[10px] text-mg-faint transition-colors hover:text-mg-muted"
            >
              CGU
            </Link>
          </nav>
        </div>
      </aside>

      <header className="fixed inset-x-0 top-0 z-40 border-b border-mg-border bg-mg-background/85 backdrop-blur-xl lg:hidden pt-[env(safe-area-inset-top,0px)]">
        <div className="flex h-14 items-center justify-between px-4">
          <Link href={margeoRoutes.home} aria-label="Retour à l'accueil" className="flex items-center gap-2">
            <Logo />
            {showBetaBadge ? (
              <span className="rounded-full border border-mg-accent/30 bg-mg-accent-soft px-1.5 py-0.5 text-[9px] font-semibold tracking-wide text-mg-accent uppercase">
                Bêta
              </span>
            ) : null}
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

      <nav className="app-shell-nav-mobile fixed inset-x-0 bottom-0 z-40 border-t border-mg-border bg-mg-background/92 backdrop-blur-xl lg:hidden pb-[env(safe-area-inset-bottom,0px)]">
        <div className="mx-auto flex max-w-md items-stretch justify-around px-0.5 pt-1 pb-1">
          {navItems.map((item) => {
            const active = isActive(item.href, item.match);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                aria-label={item.label}
                className={cn(
                  "app-shell-tab",
                  active && "app-shell-tab-active",
                  item.href === margeoRoutes.analyse &&
                    !active &&
                    "text-mg-muted",
                )}
              >
                {active ? (
                  <span className="app-shell-tab-indicator" aria-hidden />
                ) : null}
                <item.icon
                  className="size-[1.35rem]"
                  strokeWidth={active ? 2.25 : 1.75}
                />
                <span className="app-shell-tab-label truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
    </ProfileProvider>
  );
}
