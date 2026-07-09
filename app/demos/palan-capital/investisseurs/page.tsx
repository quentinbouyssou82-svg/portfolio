import type { Metadata } from "next";
import { PalanAudiencePage } from "@/components/palan-capital/palan-audience-page";
import { audiencePages } from "@/lib/palan-capital/content";

const content = audiencePages.investisseurs;

export const metadata: Metadata = {
  title: "Investisseurs qualifiés",
  description: content.meta.description,
};

export default function InvestisseursPage() {
  return <PalanAudiencePage content={content} />;
}
