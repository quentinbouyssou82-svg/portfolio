import Link from "next/link";
import { Logo } from "@/components/margeo/logo";
import { LegalFooterLinks } from "@/components/margeo/legal-footer-links";
import { DRIVEELY_CONTACT_EMAIL, PRODUCT_NAME } from "@/lib/margeo/brand";
import { DRIVEELY_PATHS } from "@/lib/margeo/constants";

/**
 * Placeholder pages juridiques — le contenu définitif sera intégré plus tard.
 */
export function LegalPlaceholderPage({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mx-auto flex min-h-[70dvh] w-full max-w-2xl flex-col px-1 py-6 sm:py-10">
      <Link href={DRIVEELY_PATHS.home} className="inline-flex w-fit">
        <Logo />
      </Link>

      <main className="mt-12 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-mg-faint">
          {PRODUCT_NAME}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-4 text-sm leading-relaxed text-mg-muted">
          {description ??
            "Cette page sera bientôt complétée. Les documents juridiques définitifs seront publiés ici."}
        </p>
        <p className="mt-6 text-sm text-mg-muted">
          Contact :{" "}
          <a
            href={`mailto:${DRIVEELY_CONTACT_EMAIL}`}
            className="font-medium text-mg-accent underline-offset-2 hover:underline"
          >
            {DRIVEELY_CONTACT_EMAIL}
          </a>
        </p>
      </main>

      <footer className="mt-16 border-t border-mg-border pt-6">
        <LegalFooterLinks />
        <Link
          href={DRIVEELY_PATHS.home}
          className="mt-4 inline-block text-sm text-mg-muted hover:text-mg-foreground"
        >
          ← Retour à l&apos;accueil
        </Link>
      </footer>
    </div>
  );
}
