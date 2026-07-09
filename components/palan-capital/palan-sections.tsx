import Link from "next/link";
import { PALAN_BASE } from "@/lib/palan-capital/constants";

export function PalanPageHero({
  eyebrow,
  title,
  intro,
  dark = false,
}: {
  eyebrow: string;
  title: string[];
  intro?: string;
  dark?: boolean;
}) {
  return (
    <header
      className={`pt-[calc(4.25rem+3rem)] pb-16 md:pb-24 ${
        dark ? "bg-[var(--navy)] text-[var(--ivory)]" : "bg-[var(--white)]"
      }`}
    >
      <div className="palan-wrap">
        <p className={`pc-eyebrow mb-6 ${dark ? "!text-[var(--gold)]" : ""}`}>{eyebrow}</p>
        <h1
          className={`pc-display max-w-3xl text-[clamp(2.25rem,5vw,3.75rem)] ${
            dark ? "text-[var(--ivory)] [&_em]:text-[var(--gold)]" : ""
          }`}
        >
          {title[0]}
          {title[1] && (
            <>
              <br />
              <em>{title[1]}</em>
            </>
          )}
        </h1>
        {intro && (
          <p className={`pc-body mt-6 max-w-2xl ${dark ? "!text-[var(--ivory)]/75" : ""}`}>{intro}</p>
        )}
      </div>
    </header>
  );
}

export function PalanSplitTitle({ parts, light = false }: { parts: string[]; light?: boolean }) {
  return (
    <h2 className={`pc-display text-[clamp(1.5rem,2.8vw,2.25rem)] ${light ? "text-[var(--ivory)] [&_em]:text-[var(--gold)]" : ""}`}>
      {parts[0]} <em>{parts[1]}</em>
    </h2>
  );
}

export function PalanCtaBand({
  lines,
  button,
  href = `${PALAN_BASE}/contact`,
}: {
  lines: string[];
  button: string;
  href?: string;
}) {
  return (
    <section className="bg-[var(--gold)]">
      <div className="palan-wrap flex flex-col items-start justify-between gap-8 py-14 md:flex-row md:items-center md:py-20">
        <p className="font-serif max-w-lg text-[clamp(1.25rem,2.2vw,1.875rem)] font-light leading-snug text-[var(--navy)]">
          {lines.map((line, i) => (
            <span key={line}>
              {i > 0 && <br />}
              {line}
            </span>
          ))}
        </p>
        <Link href={href} className="pc-btn pc-btn-navy shrink-0">
          {button}
        </Link>
      </div>
    </section>
  );
}
