import Link from "next/link";
import { Brain } from "lucide-react";

const CN = "/demos/cerveau-numerique";

const navLinkCls =
  "hidden text-sm font-medium text-[var(--cn-muted)] transition-colors duration-200 hover:text-[var(--cn-fg)] sm:inline-block";

export function LandingNav() {
  return (
    <div className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <header className="flex w-full max-w-2xl items-center justify-between gap-4 rounded-2xl border border-white/[0.08] bg-[rgba(8,9,18,0.55)] py-2.5 pl-3 pr-2 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl">
        <Link href={CN} className="inline-flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg border border-[var(--cn-primary-border)] bg-[var(--cn-primary-tint)] text-[var(--cn-primary)]">
            <Brain className="size-4" />
          </span>
          <span className="hidden text-sm font-semibold tracking-tight sm:inline">
            Cerveau Numérique
          </span>
        </Link>

        <nav className="flex items-center gap-5">
          <a href="#fonctionnalites" className={navLinkCls}>
            Fonctionnalités
          </a>
          <a href="#produit" className={navLinkCls}>
            Produit
          </a>
          <Link href={`${CN}/login`} className={navLinkCls}>
            Se connecter
          </Link>
          <Link
            href={`${CN}/onboarding`}
            className="inline-flex items-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_18px_-4px_rgba(255,255,255,0.35)]"
          >
            Essayer gratuitement
          </Link>
        </nav>
      </header>
    </div>
  );
}
