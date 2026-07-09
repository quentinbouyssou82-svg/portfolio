import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Check,
  Pause,
  Play,
  SkipForward,
} from "lucide-react";
import {
  Button,
  Card,
  CircularTimer,
  ProgressBar,
  Screen,
  SkeletonCard,
  Text,
} from "@cali/ui";
import { formatDuration } from "@cali/utils/session";
import type { ParsedWorkout } from "@cali/types";
import { apiFetch } from "@/lib/api";
import { useWorkoutSession } from "@/hooks/use-workout-session";
import { SetLogSheet } from "@/components/workout/set-log-sheet";
import { LiveStatsBar } from "@/components/workout/live-stats-bar";
import { BAR_SETUP_SECONDS } from "@cali/workout-engine";
import { isWarmupExercise } from "@/lib/warmup";
import { isFrontLeverHold, isHoldLogExercise } from "@/lib/hold-log";

export function WorkoutLivePage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState<ParsedWorkout | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;
    apiFetch<{ workout: ParsedWorkout }>(`/api/workouts/${sessionId}`)
      .then((data) => setWorkout(data.workout))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading || !workout || !sessionId) {
    return (
      <Screen className="gap-4 py-2">
        <SkeletonCard />
        <SkeletonCard />
      </Screen>
    );
  }

  return (
    <WorkoutLive sessionId={sessionId} workout={workout} onBack={() => navigate("/")} />
  );
}

function WorkoutLive({
  sessionId,
  workout,
  onBack,
}: {
  sessionId: string;
  workout: ParsedWorkout;
  onBack: () => void;
}) {
  const { view, stats, timerRemaining, timerMode, canGoBack, start, finishWork, submitLog, goBack, pause, resume, skip } =
    useWorkoutSession({ sessionId, workout });

  const [started, setStarted] = useState(false);
  const [phaseTotal, setPhaseTotal] = useState(60);

  useEffect(() => {
    if (!view) return;
    if (view.status === "EXERCISE" || view.status === "REST" || view.isWaitingInput) {
      setPhaseTotal(Math.max(timerRemaining, 1));
    }
  }, [
    view?.status,
    view?.isResting,
    view?.isWaitingInput,
    view?.currentExercise?.id,
    view?.currentSet?.setNumber,
    timerRemaining,
    view,
  ]);

  if (!view) return null;

  const isWarmup = isWarmupExercise(view.currentExercise);
  const holdMode = isHoldLogExercise(view.currentExercise);
  const isRestingUi = view.isResting || (view.isWaitingInput && timerMode === "rest");
  const setupSeconds =
    view.status === "EXERCISE" && !isRestingUi && (view.currentSet?.setNumber ?? 1) === 1
      ? BAR_SETUP_SECONDS
      : 0;
  const isBarSetupPhase =
    setupSeconds > 0 && timerRemaining > Math.max(phaseTotal - setupSeconds, 0);
  const timerAccent = isRestingUi ? "success" : isBarSetupPhase ? "warning" : view.isPaused ? "warning" : "accent";

  return (
    <Screen className="pb-2">
      {/* Top bar */}
      <header className="mb-4 flex items-center justify-between gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="min-w-0 flex-1 text-center">
          <Text variant="caption" muted className="truncate block">
            {workout.title ?? "Séance"}
          </Text>
          <Text variant="caption" className="tabular-nums font-semibold text-cali-accent">
            {formatDuration(view.elapsedSeconds)}
          </Text>
        </div>
        {canGoBack && !view.isFinished && view.status !== "READY" ? (
          <Button variant="secondary" size="sm" onClick={goBack} className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
        ) : (
          <Button variant="ghost" size="icon" disabled className="shrink-0">
            <Bot className="h-5 w-5 opacity-40" />
          </Button>
        )}
      </header>

      <ProgressBar value={view.workoutProgress} max={1} height="md" className="mb-4" />

      <LiveStatsBar
        stats={stats}
        elapsedSeconds={view.elapsedSeconds}
        estimatedRemainingSeconds={view.estimatedRemainingSeconds}
      />

      <main className="mt-4 flex min-h-0 flex-1 flex-col">
        <AnimatePresence mode="wait">
          {view.status === "READY" && !started && (
            <motion.div
              key="ready"
              className="flex flex-1 flex-col items-center justify-center gap-6 py-8"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
            >
              <div className="text-center space-y-2">
                <Text variant="display" as="h2">
                  Prêt ?
                </Text>
                <Text variant="caption" muted>
                  {workout.exercises.length} exercices · ~
                  {workout.estimatedDurationSeconds
                    ? formatDuration(workout.estimatedDurationSeconds)
                    : "—"}
                </Text>
              </div>
              <Button
                size="lg"
                fullWidth
                className="max-w-[16rem] shadow-cali-glow"
                onClick={() => {
                  setStarted(true);
                  void start();
                }}
              >
                <Play className="h-5 w-5" />
                Démarrer
              </Button>
            </motion.div>
          )}

          {(view.status === "EXERCISE" ||
            view.status === "REST" ||
            view.isPaused ||
            view.isWaitingInput) && (
            <motion.div
              key={`${view.currentExercise?.id}-${view.currentSet?.setNumber}-${isRestingUi}`}
              className="flex flex-1 flex-col gap-4"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Exercise hero card */}
              <Card padding="lg" className="text-center">
                <Text
                  variant="label"
                  className={isRestingUi ? "text-cali-success" : "text-cali-accent"}
                >
                  {isRestingUi
                    ? "Repos"
                    : isBarSetupPhase
                      ? "Préparation"
                      : isWarmup
                        ? "Échauffement"
                        : view.isPaused
                          ? "Pause"
                          : view.format}
                </Text>
                <Text variant="display" as="h1" className="mt-3 leading-tight">
                  {view.currentExercise?.name ?? "—"}
                </Text>

                {view.definition && (
                  <Text
                    variant="caption"
                    muted
                    className="mt-3 block text-left leading-relaxed px-1"
                  >
                    {view.definition}
                  </Text>
                )}

                {!isWarmup && (
                  <div className="mt-6 flex items-end justify-center gap-10">
                    <div className="text-center">
                      <Text variant="label" muted>
                        Série
                      </Text>
                      <p className="cali-text-hero text-cali-text mt-1">
                        {view.currentSet?.setNumber ?? 1}
                      </p>
                    </div>
                    <div className="text-center">
                      <Text variant="label" muted>
                        {holdMode ? "Temps" : "Reps"}
                      </Text>
                      <p className="cali-text-hero text-cali-accent mt-1">
                        {view.repTarget ?? "—"}
                      </p>
                    </div>
                    {!holdMode && view.weightTarget != null && (
                      <div className="text-center">
                        <Text variant="label" muted>
                          kg
                        </Text>
                        <p className="cali-text-hero mt-1">{view.weightTarget}</p>
                      </div>
                    )}
                  </div>
                )}

                {isWarmup && view.repTarget != null && (
                  <Text variant="caption" muted className="mt-6 block">
                    Cible : {view.repTarget}
                  </Text>
                )}

                {view.instructions && (
                  <Text variant="caption" className="mt-4 block text-left leading-relaxed text-cali-accent/90 px-1">
                    💡 {view.instructions}
                  </Text>
                )}
              </Card>

              {/* Circular timer */}
              <div className="flex justify-center py-2">
                <CircularTimer
                  seconds={timerRemaining}
                  totalSeconds={phaseTotal}
                  label={isRestingUi ? "Repos" : isBarSetupPhase ? "Vers la barre" : "Timer"}
                  sublabel={
                    view.isPaused
                      ? "En pause"
                      : isBarSetupPhase
                        ? `${setupSeconds} s pour te placer`
                        : view.isWaitingInput
                          ? "Repos en cours pendant la saisie"
                          : undefined
                  }
                  accent={timerAccent}
                  size={196}
                />
              </div>

              {/* Next exercise */}
              {view.nextExercise && (
                <Card padding="md" className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5">
                    <ArrowRight className="h-4 w-4 text-cali-text-muted" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Text variant="label" muted>
                      Suivant
                    </Text>
                    <Text variant="caption" className="truncate block font-medium mt-0.5">
                      {view.nextExercise.name}
                    </Text>
                  </div>
                </Card>
              )}
            </motion.div>
          )}

          {view.isFinished && (
            <motion.div
              key="done"
              className="flex flex-1 flex-col items-center justify-center text-center gap-3 py-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <motion.div
                className="flex h-20 w-20 items-center justify-center rounded-full bg-cali-success/15 ring-1 ring-cali-success/30"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Check className="h-10 w-10 text-cali-success" />
              </motion.div>
              <Text variant="title" className="text-cali-success">
                Séance terminée
              </Text>
              <Text variant="caption" muted>
                {stats?.totalReps ?? 0} reps · {formatDuration(view.elapsedSeconds)}
              </Text>
              <Button fullWidth size="lg" className="mt-4 max-w-[16rem]" onClick={onBack}>
                Retour à l&apos;accueil
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating action dock — masqué pendant la saisie pour laisser le formulaire visible */}
      {!view.isFinished && view.status !== "READY" && !view.isWaitingInput && (
        <motion.footer
          className="mt-4 flex items-center justify-center gap-3 pb-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="cali-glass flex items-center gap-2 rounded-2xl p-2 shadow-cali-lg">
            <Button
              variant="success"
              size="lg"
              className="min-w-[8.5rem] rounded-xl"
              onClick={finishWork}
              disabled={view.status !== "EXERCISE" && view.status !== "REST"}
            >
              <Check className="h-5 w-5" />
              {view.isResting ? "Passer repos" : isWarmup ? "Suivant" : "Terminé"}
            </Button>
            <Button
              variant="secondary"
              size="fab"
              onClick={view.isPaused ? resume : pause}
            >
              {view.isPaused ? (
                <Play className="h-5 w-5" />
              ) : (
                <Pause className="h-5 w-5" />
              )}
            </Button>
            <Button variant="secondary" size="fab" onClick={skip}>
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>
        </motion.footer>
      )}

      <SetLogSheet
        open={view.isWaitingInput}
        exerciseName={view.currentExercise?.name ?? ""}
        setNumber={view.currentSet?.setNumber ?? 1}
        holdMode={holdMode}
        frontLeverMode={isFrontLeverHold(view.currentExercise)}
        targetDurationSeconds={view.currentSet?.durationSeconds}
        restSeconds={timerMode === "rest" ? timerRemaining : undefined}
        canGoBack={canGoBack}
        onGoBack={goBack}
        onSubmit={(log) => void submitLog(log)}
      />
    </Screen>
  );
}
