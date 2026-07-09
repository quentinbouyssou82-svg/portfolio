import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button, Input, BottomSheet } from "@cali/ui";
import type { SetLogInput } from "@cali/types";
import { hapticMedium } from "@/lib/haptic";
import {
  FRONT_LEVER_FORMS,
  type FrontLeverForm,
  formatHoldLogComments,
} from "@/lib/hold-log";

interface SetLogSheetProps {
  open: boolean;
  exerciseName: string;
  setNumber: number;
  holdMode?: boolean;
  frontLeverMode?: boolean;
  targetDurationSeconds?: number;
  restSeconds?: number;
  canGoBack?: boolean;
  onGoBack?: () => void;
  onSubmit: (log: SetLogInput) => void;
}

export function SetLogSheet({
  open,
  exerciseName,
  setNumber,
  holdMode = false,
  frontLeverMode = false,
  targetDurationSeconds,
  restSeconds,
  canGoBack = false,
  onGoBack,
  onSubmit,
}: SetLogSheetProps) {

  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [rir, setRir] = useState("");
  const [duration, setDuration] = useState("");
  const [form, setForm] = useState<FrontLeverForm | "">("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) return;
    setReps("");
    setWeight("");
    setRir("");
    setNote("");
    setForm("");
    setDuration(
      targetDurationSeconds != null ? String(targetDurationSeconds) : "",
    );
  }, [open, setNumber, exerciseName, targetDurationSeconds]);

  function handleSubmit() {
    hapticMedium();

    if (holdMode) {
      onSubmit({
        durationSeconds: duration ? Number(duration) : undefined,
        comments: formatHoldLogComments(
          frontLeverMode ? (form || undefined) : undefined,
          note,
        ),
      });
      return;
    }

    onSubmit({
      actualReps: reps ? Number(reps) : undefined,
      actualWeight: weight ? Number(weight) : undefined,
      rir: rir ? Number(rir) : undefined,
      comments: note || undefined,
    });
  }

  const canSubmit = holdMode
    ? Boolean(duration) && (!frontLeverMode || Boolean(form))
    : true;

  return (
    <BottomSheet
      open={open}
      title={exerciseName}
      subtitle={
        restSeconds != null
          ? `Série ${setNumber} · Repos ${restSeconds}s`
          : `Série ${setNumber}`
      }
      className="z-[60] pb-[max(1.25rem,env(safe-area-inset-bottom))]"
    >
      {holdMode ? (
        <>
          <Input
            label="Temps de hold (s)"
            type="number"
            inputMode="numeric"
            className="text-center !h-14 !text-lg"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder={targetDurationSeconds ? String(targetDurationSeconds) : "60"}
          />

          {frontLeverMode && (
            <div className="mt-4">
              <p className="cali-text-caption text-cali-text-muted mb-2">Forme du front lever</p>
              <div className="flex flex-wrap gap-2">
                {FRONT_LEVER_FORMS.map((option) => {
                  const selected = form === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setForm(option)}
                      className={[
                        "rounded-full px-3 py-2 cali-text-caption border transition-colors",
                        selected
                          ? "border-cali-accent bg-cali-accent/15 text-cali-accent"
                          : "border-cali-border bg-cali-bg-elevated/80 text-cali-text",
                      ].join(" ")}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {!frontLeverMode && (
            <textarea
              className="mt-4 w-full rounded-xl border border-cali-border bg-cali-bg-elevated/80 p-3 cali-text-caption resize-none h-20 text-cali-text placeholder:text-cali-text-muted/50 focus:outline-none focus:ring-2 focus:ring-cali-accent/40"
              placeholder="Note (optionnel)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          )}
        </>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Reps"
              type="number"
              inputMode="numeric"
              className="text-center !h-14 !text-lg"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
            />
            <Input
              label="kg"
              type="number"
              inputMode="decimal"
              className="text-center !h-14 !text-lg"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
            <Input
              label="RIR"
              type="number"
              inputMode="numeric"
              className="text-center !h-14 !text-lg"
              value={rir}
              onChange={(e) => setRir(e.target.value)}
            />
          </div>

          <textarea
            className="mt-3 w-full rounded-xl border border-cali-border bg-cali-bg-elevated/80 p-3 cali-text-caption resize-none h-20 text-cali-text placeholder:text-cali-text-muted/50 focus:outline-none focus:ring-2 focus:ring-cali-accent/40"
            placeholder="Commentaire (optionnel)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </>
      )}

      {canGoBack && onGoBack && (
        <Button
          variant="secondary"
          fullWidth
          size="sm"
          className="mt-4"
          onClick={onGoBack}
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
      )}

      <Button
        fullWidth
        size="lg"
        className="mt-4"
        onClick={handleSubmit}
        disabled={!canSubmit}
      >
        {holdMode ? "Valider le hold" : "Valider la série"}
      </Button>
    </BottomSheet>
  );
}
