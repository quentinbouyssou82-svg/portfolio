import type { Metadata } from "next";
import { PalanAudiencePage } from "@/components/palan-capital/palan-audience-page";
import { audiencePages } from "@/lib/palan-capital/content";

const content = audiencePages.dirigeants;

export const metadata: Metadata = {
  title: "Dirigeants & cédants",
  description: content.meta.description,
};

export default function DirigeantsPage() {
  return <PalanAudiencePage content={content} />;
}
