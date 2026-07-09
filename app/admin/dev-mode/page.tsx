import { notFound } from "next/navigation";
import { DevModePanel } from "@/components/maison/dev-mode-panel";
import { isMaisonDevModeAllowed } from "@/lib/maison/dev/constants";

export default function AdminDevModePage() {
  if (!isMaisonDevModeAllowed()) {
    notFound();
  }

  return <DevModePanel />;
}
