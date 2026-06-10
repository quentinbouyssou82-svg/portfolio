import { McnPageHeader } from "@/components/mon-cerveau-numerique/mcn-page-header";
import { McnTasksPanel } from "@/components/mon-cerveau-numerique/mcn-tasks-panel";

export default function McnTodosPage() {
  return (
    <div className="p-4 md:p-8">
      <McnPageHeader
        title="Tâches"
        description="To-do proactive — ajoute, coche et organise tes priorités."
      />
      <McnTasksPanel />
    </div>
  );
}
