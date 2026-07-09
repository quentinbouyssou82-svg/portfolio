import type { Metadata } from "next";
import { PalanAudiencePage } from "@/components/palan-capital/palan-audience-page";
import { audiencePages } from "@/lib/palan-capital/content";

const content = audiencePages.fonds;

export const metadata: Metadata = {
  title: "Fonds d'investissement",
  description: content.meta.description,
};

export default function FondsPage() {
  return <PalanAudiencePage content={content} />;
}
