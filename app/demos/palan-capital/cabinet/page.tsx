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
      <div className="grid lg:min-h-[calc(100vh-4.25rem)] lg:grid-cols-2">
        <div className="relative min-h-[22rem] bg-[var(--navy-light)] lg:min-h-0">
          <Image
            src="/demos/palan-capital/photo-julien.jpg"
            alt="Julien Guiraud, fondateur de Palan Capital"
            fill
            className="object-cover object-[center_15%]"
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>

        <div className="flex flex-col justify-center bg-[var(--ivory)] px-5 py-16 md:px-12 md:py-20 lg:px-16">
          <p className="pc-eyebrow mb-8">{c.tag}</p>
          <h1 className="pc-display text-[clamp(2.5rem,4vw,3.25rem)]">
            {c.name[0]}
            <br />
            {c.name[1]}
          </h1>
          <p className="pc-label mt-4">{c.role}</p>
          <hr className="pc-divider my-10 w-12" />
          {c.bios.map((bio) => (
            <p key={bio.slice(0, 40)} className="pc-body mb-6 !leading-[2]">
              {bio}
            </p>
          ))}
          <p className="text-[0.75rem] leading-[1.9] text-[var(--gray)]">
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
