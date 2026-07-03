import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Button } from "../ui/button";

export function WizardFooter({
  onBack,
  onNext,
  canGoBack,
  canGoNext,
  isLast,
}: {
  onBack: () => void;
  onNext: () => void;
  canGoBack: boolean;
  canGoNext: boolean;
  isLast: boolean;
}) {
  return (
    <div className="mx-auto flex w-full max-w-xl items-center justify-between px-6 pb-10">
      <Button
        variant="secondary"
        onClick={onBack}
        disabled={!canGoBack}
        className="disabled:opacity-40"
      >
        <ChevronLeft className="size-4" />
        Retour
      </Button>
      <Button onClick={onNext} disabled={!canGoNext}>
        {isLast ? "Terminer" : "Suivant"}
        {isLast ? <Check className="size-4" /> : <ChevronRight className="size-4" />}
      </Button>
    </div>
  );
}
