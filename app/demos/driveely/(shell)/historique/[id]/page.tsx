import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AnalysisResult } from "@/components/margeo/analyse/analysis-result";
import { DeleteAnalysisButton } from "@/components/margeo/delete-analysis-button";
import { getAnalysisById } from "@/lib/margeo/services/analyses";
import { getCurrentProfile } from "@/lib/margeo/services/profile";
import { DRIVEELY_PATHS } from "@/lib/margeo/constants";
import { margeoRoutes } from "@/lib/margeo/routes";
import { redirect } from "next/navigation";

export default async function AnalysisDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const profile = await getCurrentProfile();
  if (!profile?.id) redirect(DRIVEELY_PATHS.login);

  const { id } = await params;
  const analysis = await getAnalysisById(profile.id, id);
  if (!analysis) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={margeoRoutes.historique}
          className="inline-flex items-center gap-2 text-sm text-mg-muted transition-colors hover:text-mg-foreground"
        >
          <ArrowLeft className="size-4" />
          Retour à l&apos;historique
        </Link>
        <DeleteAnalysisButton analysisId={analysis.id} />
      </div>
      <AnalysisResult analysis={analysis} />
    </div>
  );
}
