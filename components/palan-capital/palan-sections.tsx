import Link from "next/link";
import { PALAN_BASE } from "@/lib/palan-capital/constants";

type CtaBandProps = {
  lines: string[];
  button: string;
  href?: string;
};

export function PalanCtaBand({ lines, button, href = `${PALAN_BASE}/contact` }: CtaBandProps) {
  return (
    <section className="flex flex-col items-start justify-between gap-8 bg-[var(--palan-gold)] px-5 py-14 md:flex-row md:items-center md:px-10 md:py-20 lg:px-16">
      <p className="font-display max-w-xl text-[clamp(1.35rem,2.5vw,2.25rem)] font-light leading-snug text-white">
        {lines.map((line, i) => (
          <span key={line}>
            {i > 0 && <br />}
            {i === lines.length - 1 && lines.length > 1 ? (
              <em className="italic">{line}</em>
            ) : (
              <>
                {line}
                {i < lines.length - 1 && !line.endsWith(",") && ","}
              </>
            )}
          </span>
        ))}
      </p>
      <Link
        href={href}
        className="shrink-0 bg-white px-8 py-3 text-[0.68rem] font-medium uppercase tracking-[0.13em] text-[var(--palan-navy)] transition-opacity hover:opacity-80"
      >
        {button}
      </Link>
    </section>
  );
}

export function PalanPageHero({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string[];
  intro?: string;
}) {
  return (
    <section className="bg-[var(--palan-navy)] px-5 pb-16 pt-32 md:px-10 md:pb-20 md:pt-36 lg:px-16">
      <div className="mx-auto max-w-[90rem]">
        <p className="mb-4 text-[0.65rem] uppercase tracking-[0.2em] text-[var(--palan-gold)]">{eyebrow}</p>
        <h1 className="font-display max-w-3xl text-[clamp(2rem,5vw,4.5rem)] font-light leading-[1.08] text-white">
          {title[0]}
          {title[1] && (
            <>
              <br />
              <em className="text-[var(--palan-gold)] italic">{title[1]}</em>
            </>
          )}
        </h1>
        {intro && (
          <p className="mt-6 max-w-lg text-[0.85rem] leading-[1.85] text-white/55">{intro}</p>
        )}
      </div>
    </section>
  );
}

export function PalanSplitTitle({ parts }: { parts: string[] }) {
  return (
    <h2 className="font-display text-[clamp(1.6rem,3vw,3rem)] font-light leading-tight text-[var(--palan-navy)]">
      {parts[0]}{" "}
      <em className="text-[var(--palan-gold)] italic">{parts[1]}</em>
    </h2>
  );
}
