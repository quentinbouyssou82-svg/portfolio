"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

const LINKS = [
  { href: "#fonctionnement", label: "Comment ça marche" },
  { href: "#fonctionnalites", label: "Fonctionnalités" },
  { href: "#faq", label: "FAQ" },
  { href: "/premium", label: "Premium" },
];

export function LandingNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" aria-label="Margeo — accueil">
          <Logo />
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-white/[0.05] hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2.5 md:flex">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              Se connecter
            </Button>
          </Link>
          <Link href="/analyse">
            <Button size="sm">Analyser une course</Button>
          </Link>
        </div>

        <button
          className="rounded-lg p-2 text-muted hover:text-foreground md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-border bg-background px-5 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm text-muted hover:bg-white/[0.05] hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/analyse" onClick={() => setOpen(false)} className="mt-2">
              <Button className="w-full">Analyser une course</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
