import type { Metadata } from "next";
import { PalanAudiencePage } from "@/components/palan-capital/palan-audience-page";
import { audiencePages } from "@/lib/palan-capital/content";

const content = audiencePages["patrimoines-prives"];

export const metadata: Metadata = {
  title: content.meta.title.replace(" — Palan Capital", ""),
  description: content.meta.description,
};

export default function PatrimoinesPage() {
  return <PalanAudiencePage content={content} />;
}
