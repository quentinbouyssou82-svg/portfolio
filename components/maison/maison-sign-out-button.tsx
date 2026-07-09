"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { MAISON_PATHS } from "@/lib/maison/constants";

type Props = {
  variant?: "button" | "link";
  className?: string;
};

export function MaisonSignOutButton({ variant = "button", className = "" }: Props) {
  if (variant === "link") {
    return (
      <Link
        href={MAISON_PATHS.deconnexion}
        className={`text-xs text-ash hover:text-ink/70 underline-offset-2 hover:underline ${className}`}
      >
        Se déconnecter
      </Link>
    );
  }

  return (
    <Link
      href={MAISON_PATHS.deconnexion}
      className={`w-full flex items-center justify-center gap-2 rounded-2xl border border-border bg-paper px-5 py-4 text-sm text-ink/70 hover:text-ink transition-colors ${className}`}
    >
      <LogOut className="h-4 w-4" />
      Se déconnecter
    </Link>
  );
}
