import type { Metadata } from "next";
import { PalanAudiencePage } from "@/components/palan-capital/palan-audience-page";
import { audiencePages } from "@/lib/palan-capital/content";

const content = audiencePages["patrimoines-prives"];

export const metadata: Metadata = {
  title: "Patrimoines privés",
  description: content.meta.description,
};

export default function PatrimoinesPrivesPage() {
  return <PalanAudiencePage content={content} />;
}
