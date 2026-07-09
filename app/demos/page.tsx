import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const demos = [
  {
    href: "/demos/uberly",
    name: "Uberly",
    sector: "Copilote IA · Livraison",
    accent: "from-indigo-400/20 to-transparent",
    border: "border-indigo-400/25",
  },
  {
    href: "/demos/cerveau-numerique",
    name: "Mon Cerveau Numérique",
    sector: "Assistant de vie · IA",
    accent: "from-[#4f9eff]/20 to-transparent",
    border: "border-[#4f9eff]/25",
  },
  {
    href: "/demos/maison",
    name: "Maison",
    sector: "Planification repas · Famille",
    accent: "from-emerald-500/20 to-transparent",
    border: "border-emerald-500/25",
  },
  {
    href: "/demos/lifeos",
    name: "LifeOS",
    sector: "Life progression · Gamification",
    accent: "from-violet-500/25 to-transparent",
    border: "border-violet-500/30",
  },
  {
    href: "/demos/apex-advisory",
    name: "Palan Capital",
    sector: "Ingénierie financière · FR",
    accent: "from-[#d4c4a8]/20 to-transparent",
    border: "border-[#d4c4a8]/25",
  },
  {
    href: "/demos/meridian-capital",
    name: "Meridian Capital",
    sector: "Ingénierie financière · FR",
    accent: "from-[#C8A24A]/15 to-transparent",
    border: "border-[#C8A24A]/20",
  },
  {
    href: "/demos/bella-vista",
    name: "Bella Vista",
    sector: "Restaurant gastronomique",
    accent: "from-amber-500/20 to-transparent",
    border: "border-amber-500/25",
  },
  {
    href: "/demos/titan-fitness",
    name: "Titan Fitness",
    sector: "Salle de sport premium",
    accent: "from-lime-400/20 to-transparent",
    border: "border-lime-400/25",
  },
  {
    href: "/demos/nova-habitat",
    name: "Nova Habitat",
    sector: "Rénovation & travaux",
    accent: "from-sky-400/20 to-transparent",
    border: "border-sky-400/25",
  },
];

export default function HubPage() {
  return (
    <main className="min-h-screen bg-[#08080a] px-6 py-20 text-white">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs uppercase tracking-[0.24em] text-white/45">
          Nocta Agency · Projets conceptuels
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">
          Démonstrations web premium
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-white/60">
          Expériences complètes conçues pour illustrer design, conversion
          et fonctionnalités avancées.
        </p>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {demos.map((demo) => (
            <Link
              key={demo.href}
              href={demo.href}
              className={`group relative overflow-hidden rounded-3xl border bg-white/[0.03] p-7 transition hover:-translate-y-1 hover:bg-white/[0.05] ${demo.border}`}
            >
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${demo.accent}`}
              />
              <p className="relative text-xs uppercase tracking-[0.18em] text-white/45">
                {demo.sector}
              </p>
              <h2 className="relative mt-3 text-2xl font-semibold">{demo.name}</h2>
              <span className="relative mt-8 inline-flex items-center gap-2 text-sm text-white/70 transition group-hover:text-white">
                Voir la démo
                <ArrowUpRight className="size-4" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
