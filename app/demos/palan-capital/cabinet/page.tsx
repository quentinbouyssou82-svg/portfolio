import type { Metadata } from "next";
import Image from "next/image";
import { PalanCtaBand } from "@/components/palan-capital/palan-sections";
import { cabinetContent } from "@/lib/palan-capital/content";
import { PALAN_BASE } from "@/lib/palan-capital/constants";

export const metadata: Metadata = {
  title: "Cabinet",
  description: cabinetContent.meta.description,
};

export default function CabinetPage() {
  const c = cabinetContent;

  return (
    <>
      <div className="grid min-h-[calc(100vh-4.5rem)] lg:grid-cols-2">
        <div className="relative min-h-[24rem] lg:min-h-0">
          <Image
            src="/demos/palan-capital/photo-julien.jpg"
            alt="Julien Guiraud, fondateur de Palan Capital"
            fill
            className="object-cover object-[center_15%]"
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>

        <div className="flex flex-col justify-center bg-[var(--palan-ivory)] px-5 py-16 md:px-12 md:py-20 lg:px-16">
          <div className="palan-section-tag mb-8">{c.tag}</div>
          <h1 className="font-display mb-3 text-[clamp(2.5rem,4vw,3.5rem)] font-light leading-[1.05] text-[var(--palan-navy)]">
            {c.name[0]}
            <br />
            {c.name[1]}
          </h1>
          <p className="mb-8 text-[0.68rem] uppercase tracking-[0.18em] text-[var(--palan-gold)]">{c.role}</p>
          <div className="mb-10 h-px w-10 bg-[var(--palan-gold)]" />
          {c.bios.map((bio) => (
            <p key={bio.slice(0, 40)} className="mb-6 text-[0.875rem] leading-[2] text-[var(--palan-gray)]">
              {bio}
            </p>
          ))}
          <p className="text-[0.75rem] leading-[1.85] text-[var(--palan-navy)]/40">
            {c.details.map((d) => (
              <span key={d} className="block">
                {d}
              </span>
            ))}
          </p>
        </div>
      </div>

      <PalanCtaBand lines={c.cta.text} button={c.cta.button} href={`${PALAN_BASE}/contact`} />
    </>
  );
}
