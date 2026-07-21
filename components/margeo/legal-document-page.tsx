import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Logo } from "@/components/margeo/logo";
import { LegalFooterLinks } from "@/components/margeo/legal-footer-links";
import { UBERLY_CONTACT_EMAIL, PRODUCT_NAME } from "@/lib/margeo/brand";
import { UBERLY_PATHS } from "@/lib/margeo/constants";
import type { UberlyLegalDocument } from "@/lib/margeo/legal/documents";
import { UBERLY_LEGAL_DOCUMENTS } from "@/lib/margeo/legal/documents";
import { cn } from "@/lib/margeo/utils";

export function LegalDocumentView({
  doc,
  markdown,
}: {
  doc: UberlyLegalDocument;
  markdown: string;
}) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col px-1 py-6 sm:py-10">
      <Link href={UBERLY_PATHS.home} className="inline-flex w-fit">
        <Logo />
      </Link>

      <header className="mt-10 border-b border-mg-border pb-6">
        <p className="text-xs font-medium uppercase tracking-wide text-mg-faint">
          {PRODUCT_NAME} · Documents juridiques
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-mg-foreground sm:text-4xl">
          {doc.title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-mg-muted">
          {doc.description}
        </p>
      </header>

      <article
        className={cn(
          "legal-prose mt-8 max-w-none text-[0.9375rem] leading-relaxed text-mg-foreground",
          "[&_h1]:mb-4 [&_h1]:mt-0 [&_h1]:text-2xl [&_h1]:font-bold",
          "[&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold",
          "[&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold",
          "[&_p]:mb-4 [&_p]:text-mg-muted [&_p]:leading-relaxed",
          "[&_ul]:mb-4 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_ul]:text-mg-muted",
          "[&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-5 [&_ol]:text-mg-muted",
          "[&_li]:leading-relaxed",
          "[&_strong]:font-semibold [&_strong]:text-mg-foreground",
          "[&_a]:font-medium [&_a]:text-mg-accent [&_a]:underline-offset-2 hover:[&_a]:underline",
          "[&_hr]:my-8 [&_hr]:border-mg-border",
          "[&_blockquote]:my-4 [&_blockquote]:border-l-2 [&_blockquote]:border-mg-border [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-mg-muted",
          "[&_table]:mb-6 [&_table]:w-full [&_table]:border-collapse [&_table]:text-left [&_table]:text-sm",
          "[&_th]:border-b [&_th]:border-mg-border [&_th]:px-2 [&_th]:py-2 [&_th]:font-semibold [&_th]:text-mg-foreground",
          "[&_td]:border-b [&_td]:border-mg-border/60 [&_td]:px-2 [&_td]:py-2 [&_td]:align-top [&_td]:text-mg-muted",
          "[&_code]:rounded [&_code]:bg-mg-card [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs",
        )}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            a: ({ href, children }) => {
              const isExternal = href?.startsWith("http");
              if (!href) return <span>{children}</span>;
              if (isExternal) {
                return (
                  <a href={href} target="_blank" rel="noopener noreferrer">
                    {children}
                  </a>
                );
              }
              return <Link href={href}>{children}</Link>;
            },
            // Skip the first H1 (already in page header) when document starts with #
            h1: ({ children }) => (
              <h1 className="sr-only">{children}</h1>
            ),
          }}
        >
          {markdown}
        </ReactMarkdown>
      </article>

      <aside className="mt-12 rounded-2xl border border-mg-border bg-mg-card/60 p-5">
        <p className="text-sm font-semibold text-mg-foreground">
          Autres documents
        </p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {UBERLY_LEGAL_DOCUMENTS.filter((d) => d.id !== doc.id).map((d) => (
            <li key={d.id}>
              <Link
                href={d.path}
                className="text-sm text-mg-muted transition-colors hover:text-mg-foreground"
              >
                {d.title}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-mg-muted">
          Contact :{" "}
          <a
            href={`mailto:${UBERLY_CONTACT_EMAIL}`}
            className="font-medium text-mg-accent underline-offset-2 hover:underline"
          >
            {UBERLY_CONTACT_EMAIL}
          </a>
        </p>
      </aside>

      <footer className="mt-10 border-t border-mg-border pt-6">
        <LegalFooterLinks />
        <Link
          href={UBERLY_PATHS.home}
          className="mt-4 inline-block text-sm text-mg-muted hover:text-mg-foreground"
        >
          ← Retour à l&apos;accueil
        </Link>
      </footer>
    </div>
  );
}
