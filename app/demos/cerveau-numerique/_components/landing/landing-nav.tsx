import Link from "next/link";
import { Brain } from "lucide-react";

const CN = "/demos/cerveau-numerique";

export function LandingNav() {
  return (
    <header className="relative z-20 border-b border-white/[0.06] bg-[var(--cn-hero-bg)]/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href={CN} className="inline-flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg border border-[var(--cn-primary-border)] bg-[var(--cn-primary-tint)] text-[var(--cn-primary)]">
            <Brain className="size-4" />
          </span>
          <span className="text-sm font-semibold tracking-tight">
            Cerveau Numérique
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href={`${CN}/login`}
            className="hidden text-sm font-medium text-[var(--cn-muted)] transition-colors hover:text-[var(--cn-fg)] sm:inline-block"
          >
            Se connecter
          </Link>
          <Link
            href={`${CN}/onboarding`}
            className="inline-flex items-center rounded-[var(--cn-radius-sm)] bg-white px-4 py-2 text-sm font-semibold text-black transition-transform hover:-translate-y-0.5"
          >
            Essayer gratuitement
          </Link>
        </div>
      </div>
    </header>
  );
}
