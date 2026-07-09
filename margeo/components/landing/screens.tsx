"use client";

import { Reveal } from "@/components/reveal";
import { VerdictBadge } from "@/components/verdict-badge";
import type { Verdict } from "@/lib/types";

interface FakeScan {
  platform: string;
  route: string;
  payout: string;
  net: string;
  hourly: string;
  score: number;
  verdict: Verdict;
}

const SCANS: FakeScan[] = [
  {
    platform: "Stuart",
    route: "Apple Store Part-Dieu → Préfecture",
    payout: "13,60 €",
    net: "12,35 €",
    hourly: "43,6 €/h",
    score: 96,
    verdict: "accept",
  },
  {
    platform: "Deliveroo",
    route: "Sushi Kyo → Montchat",
    payout: "5,10 €",
    net: "2,70 €",
    hourly: "6,7 €/h",
    score: 31,
    verdict: "refuse",
  },
  {
    platform: "Shopopop",
    route: "Drive Carrefour → Saint-Fons",
    payout: "14,50 €",
    net: "10,46 €",
    hourly: "18,5 €/h",
    score: 64,
    verdict: "check",
  },
];

const VERDICT_COLOR: Record<Verdict, string> = {
  accept: "var(--color-go)",
  check: "var(--color-check)",
  refuse: "var(--color-stop)",
};

/** Galerie de « captures » d'analyses réelles, reconstruites en HTML. */
export function Screens() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold tracking-wide text-accent uppercase">
            En conditions réelles
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Trois propositions, trois verdicts
          </h2>
          <p className="mt-4 text-muted">
            Le même montant affiché peut cacher des réalités très différentes.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {SCANS.map((scan, i) => (
            <Reveal
              key={scan.route}
              delay={i * 0.12}
              className="rounded-2xl border border-border bg-card p-5 shadow-card transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted">
                  {scan.platform}
                </span>
                <VerdictBadge verdict={scan.verdict} />
              </div>

              <p className="mt-3 truncate text-sm text-foreground">
                {scan.route}
              </p>

              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-xs text-faint">Affiché / Net réel</p>
                  <p className="mt-1 text-lg font-semibold text-foreground">
                    {scan.payout}{" "}
                    <span className="text-sm text-muted">→ {scan.net}</span>
                  </p>
                  <p
                    className="mt-0.5 text-sm font-semibold"
                    style={{ color: VERDICT_COLOR[scan.verdict] }}
                  >
                    {scan.hourly}
                  </p>
                </div>
                <div
                  className="flex size-14 items-center justify-center rounded-2xl text-lg font-bold"
                  style={{
                    color: VERDICT_COLOR[scan.verdict],
                    backgroundColor: `color-mix(in srgb, ${
                      VERDICT_COLOR[scan.verdict]
                    } 12%, transparent)`,
                  }}
                >
                  {scan.score}
                </div>
              </div>

              {/* Barre de score */}
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${scan.score}%`,
                    backgroundColor: VERDICT_COLOR[scan.verdict],
                  }}
                />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
