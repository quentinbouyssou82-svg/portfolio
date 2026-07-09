"use client";

import { ApexLogo } from "./apex-logo";
import { useApexLocale } from "./apex-locale-provider";

export function ApexFooter() {
  const { t } = useApexLocale();
  const { footer } = t;
  const legalLines = footer.legal.split("\n");

  return (
    <footer className="border-t border-[var(--ax-border-subtle)] bg-[var(--ax-bg-elevated)] py-14">
      <div className="apex-wrap">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row md:items-start">
          <div className="max-w-md text-center md:text-left">
            <div className="ax-logo ax-logo--footer">
              <ApexLogo variant="lockup" tone="muted" />
            </div>
            <p className="ax-body-sm mt-4">{footer.description}</p>
          </div>
          <p className="ax-body-sm max-w-sm text-center md:text-right">
            {legalLines.map((line, i) => (
              <span key={line}>
                {i > 0 ? <br /> : null}
                {line}
              </span>
            ))}
          </p>
        </div>
        <p className="ax-body-sm mt-10 text-center text-[var(--ax-text-muted)]">
          © {new Date().getFullYear()} Palan Capital
        </p>
      </div>
    </footer>
  );
}
