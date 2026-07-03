import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandIcon } from "../ui/brand-icon";

const CN = "/demos/cerveau-numerique";

const footerLinks = [
  { label: "CGU", href: `${CN}/legal/cgu` },
  { label: "Politique de confidentialité", href: `${CN}/legal/confidentialite` },
  { label: "DPA sous-traitants", href: `${CN}/legal/dpa` },
];

export function LegalShell({
  title,
  meta,
  intro,
  children,
  currentHref,
}: {
  title: string;
  meta: string;
  intro?: React.ReactNode;
  children: React.ReactNode;
  currentHref: string;
}) {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="cn-aurora" aria-hidden />
      <div className="relative z-10 mx-auto max-w-3xl px-6 py-12">
        <div className="flex items-center justify-between">
          <Link
            href={CN}
            className="inline-flex items-center gap-2 text-sm text-[var(--cn-muted)] transition-colors hover:text-[var(--cn-fg)]"
          >
            <ArrowLeft className="size-4" />
            Accueil
          </Link>
          <BrandIcon size="sm" />
        </div>

        <header className="mt-10 border-b border-[var(--cn-border-soft)] pb-8">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            {title}
          </h1>
          <p className="mt-2 text-sm text-[var(--cn-faint)]">{meta}</p>
          {intro && (
            <p className="mt-5 text-sm leading-relaxed text-[var(--cn-muted)]">
              {intro}
            </p>
          )}
        </header>

        <article className="cn-legal mt-8 space-y-10">{children}</article>

        <footer className="mt-14 flex flex-wrap gap-x-6 gap-y-2 border-t border-[var(--cn-border-soft)] pt-8 text-sm">
          {footerLinks
            .filter((link) => link.href !== currentHref)
            .map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[var(--cn-primary)] transition-colors hover:brightness-110"
              >
                {link.label}
              </Link>
            ))}
        </footer>
      </div>
    </main>
  );
}

export function LegalSection({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold tracking-tight text-[var(--cn-fg)]">
        <span className="text-[var(--cn-primary)]">{n}.</span> {title}
      </h2>
      <div className="space-y-3 text-sm leading-relaxed text-[var(--cn-muted)]">
        {children}
      </div>
    </section>
  );
}

export function LegalList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="list-disc space-y-1.5 pl-5 marker:text-[var(--cn-faint)]">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

export function LegalTable({
  head,
  rows,
}: {
  head: string[];
  rows: string[][];
}) {
  return (
    <div className="overflow-x-auto rounded-[var(--cn-radius-sm)] border border-[var(--cn-border)]">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="bg-white/[0.04]">
            {head.map((cell) => (
              <th
                key={cell}
                className="px-4 py-3 font-semibold text-[var(--cn-fg)]"
              >
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-t border-[var(--cn-border-soft)] text-[var(--cn-muted)]"
            >
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
