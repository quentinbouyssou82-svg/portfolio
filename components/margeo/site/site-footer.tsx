import {
  DRIVEELY_CONTACT_EMAIL,
  PRODUCT_NAME,
  PRODUCT_TAGLINE,
} from "@/lib/margeo/brand";
import Link from "next/link";

const LEGAL = [
  { href: "/confidentialite", label: "Confidentialité" },
  { href: "/cgu", label: "CGU" },
  { href: "/cgv", label: "CGV" },
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/contact", label: "Contact" },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.06] px-4 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-10 sm:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[14px] font-semibold text-[#FAFAFA]">
            {PRODUCT_NAME}
          </p>
          <p className="mt-1 text-[13px] text-[#A1A1AA]">{PRODUCT_TAGLINE}</p>
          <a
            href={`mailto:${DRIVEELY_CONTACT_EMAIL}`}
            className="mt-1 inline-flex min-h-11 items-center text-[13px] text-[#A1A1AA] underline-offset-2 hover:underline"
          >
            {DRIVEELY_CONTACT_EMAIL}
          </a>
        </div>
        <nav className="flex flex-wrap gap-x-4 gap-y-1">
          {LEGAL.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex min-h-11 items-center text-[13px] font-medium text-[#A1A1AA] transition-colors hover:text-[#FAFAFA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#818CF8]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <p className="mx-auto mt-6 max-w-5xl text-[12px] leading-relaxed text-[#8B8B94] sm:mt-8">
        Driveely n’est affilié à aucune plateforme de livraison. Les résultats
        sont des estimations — à vous de décider.
      </p>
    </footer>
  );
}
