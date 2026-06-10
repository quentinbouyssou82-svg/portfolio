import { McnDocumentsPanel } from "@/components/mon-cerveau-numerique/mcn-documents-panel";
import { McnPageHeader } from "@/components/mon-cerveau-numerique/mcn-page-header";

export default function McnDocumentsPage() {
  return (
    <div className="p-4 md:p-8">
      <McnPageHeader
        title="Documents"
        description="GED intelligente — classe et retrouve tes documents en 2 secondes."
      />
      <McnDocumentsPanel />
    </div>
  );
}
