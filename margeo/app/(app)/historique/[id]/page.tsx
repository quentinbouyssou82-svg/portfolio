import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AnalysisResult } from "@/components/analyse/analysis-result";
import { DEMO_ANALYSES, getAnalysisById } from "@/lib/data";

export function generateStaticParams() {
  return DEMO_ANALYSES.map((analysis) => ({ id: analysis.id }));
}

export default async function AnalysisDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const analysis = getAnalysisById(id);
  if (!analysis) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/historique"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Retour à l&apos;historique
      </Link>
      <AnalysisResult analysis={analysis} />
    </div>
  );
}
