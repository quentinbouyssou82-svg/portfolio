import type { Metadata } from "next";
import { LegalDocumentView } from "@/components/margeo/legal-document-page";
import {
  getLegalDocument,
  type UberlyLegalDocId,
} from "@/lib/margeo/legal/documents";
import { loadUberlyLegalMarkdown } from "@/lib/margeo/legal/load-document";

export function buildLegalMetadata(id: UberlyLegalDocId): Metadata {
  const doc = getLegalDocument(id);
  return {
    title: doc.title,
    description: doc.description,
    robots: { index: false, follow: false },
  };
}

export function UberlyLegalPage({ id }: { id: UberlyLegalDocId }) {
  const doc = getLegalDocument(id);
  const markdown = loadUberlyLegalMarkdown(id);
  return <LegalDocumentView doc={doc} markdown={markdown} />;
}
