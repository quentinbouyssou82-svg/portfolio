import Link from "next/link";

const CN = "/demos/cerveau-numerique";

const links = [
  { label: "CGU", href: `${CN}/legal/cgu` },
  { label: "Confidentialité", href: `${CN}/legal/confidentialite` },
  { label: "DPA", href: `${CN}/legal/dpa` },
];

export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-white/[0.06] px-6 py-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-xs text-[var(--cn-ghost)]">
          © {new Date().getFullYear()} Mon Cerveau Numérique
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[var(--cn-ghost)]">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-[var(--cn-muted)]"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
