"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Home, ShoppingBasket, Sparkles, Users } from "lucide-react";
import { MAISON_PATHS } from "@/lib/maison/constants";

const items = [
  { href: MAISON_PATHS.home, label: "Accueil", icon: Home, exact: true },
  { href: MAISON_PATHS.planning, label: "Repas", icon: CalendarDays },
  { href: MAISON_PATHS.courses, label: "Courses", icon: ShoppingBasket },
  { href: MAISON_PATHS.nutrition, label: "Équilibre", icon: Sparkles },
  { href: MAISON_PATHS.profils, label: "Famille", icon: Users },
];

export function MaisonBottomNav() {
  const pathname = usePathname();

  const hideNav =
    pathname === MAISON_PATHS.connexion ||
    pathname === MAISON_PATHS.onboarding ||
    pathname === MAISON_PATHS.enAttente;

  if (hideNav) return null;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-paper/85 backdrop-blur-xl">
      <div className="mx-auto max-w-md flex items-center justify-around px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {items.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-colors"
            >
              <Icon
                className={`h-[18px] w-[18px] transition-colors ${active ? "text-ink" : "text-ash"}`}
                strokeWidth={active ? 2 : 1.6}
              />
              <span
                className={`text-[10px] tracking-wide transition-colors ${
                  active ? "text-ink font-medium" : "text-ash"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
