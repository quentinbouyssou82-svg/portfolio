import type { Metadata } from "next";
import { LegalDocumentView } from "@/components/margeo/legal-document-page";
import {
  getLegalDocument,
  type DriveelyLegalDocId,
} from "@/lib/margeo/legal/documents";
import { loadDriveelyLegalMarkdown } from "@/lib/margeo/legal/load-document";

export function buildLegalMetadata(id: DriveelyLegalDocId): Metadata {
  const doc = getLegalDocument(id);
  return {
    title: doc.title,
    description: doc.description,
    robots: { index: false, follow: false },
  };
}

export function DriveelyLegalPage({ id }: { id: DriveelyLegalDocId }) {
  const doc = getLegalDocument(id);
  const markdown = loadDriveelyLegalMarkdown(id);
  return <LegalDocumentView doc={doc} markdown={markdown} />;
}
