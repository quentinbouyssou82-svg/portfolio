import Link from "next/link";
import { DRIVEELY_LEGAL_DOCUMENTS } from "@/lib/margeo/legal/documents";
import { margeoRoutes } from "@/lib/margeo/routes";
import { cn } from "@/lib/margeo/utils";

/** Liens footer principaux (demande produit). */
export const LEGAL_FOOTER_LINKS = [
  ...DRIVEELY_LEGAL_DOCUMENTS.filter((d) => d.inFooter).map((d) => ({
    label: d.footerLabel ?? d.title,
    href: d.path,
  })),
  { label: "Contact", href: margeoRoutes.contact },
] as const;

export function LegalFooterLinks({
  className,
  linkClassName,
}: {
  className?: string;
  linkClassName?: string;
}) {
  return (
    <nav aria-label="Informations légales" className={className}>
      <ul className="flex flex-wrap gap-x-4 gap-y-2">
        {LEGAL_FOOTER_LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={cn(
                "text-xs text-mg-faint transition-colors hover:text-mg-foreground",
                linkClassName,
              )}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
