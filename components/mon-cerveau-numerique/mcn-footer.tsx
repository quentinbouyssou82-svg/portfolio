import Link from "next/link";
import { MCN_PATHS } from "@/lib/mon-cerveau-numerique/constants";

export function McnFooter() {
  return (
    <footer className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 py-10">
      <Link
        href={MCN_PATHS.legal.cgu}
        className="text-xs text-[var(--mcn-fg-subtle)] transition-colors hover:text-[var(--mcn-fg-muted)]"
      >
        CGU
      </Link>
      <Link
        href={MCN_PATHS.legal.confidentialite}
        className="text-xs text-[var(--mcn-fg-subtle)] transition-colors hover:text-[var(--mcn-fg-muted)]"
      >
        Confidentialité
      </Link>
      <Link
        href={MCN_PATHS.legal.dpa}
        className="text-xs text-[var(--mcn-fg-subtle)] transition-colors hover:text-[var(--mcn-fg-muted)]"
      >
        DPA
      </Link>
    </footer>
  );
}
