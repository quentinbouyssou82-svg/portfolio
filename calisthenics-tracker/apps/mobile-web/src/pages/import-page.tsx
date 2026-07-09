import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ClipboardPaste,
  FileCode2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Card, Header, ProgressBar, Screen, Text } from "@cali/ui";
import { parseWorkout, OFFICIAL_WORKOUT_TEMPLATE } from "@/lib/parse-workout";
import { clientLogger } from "@/lib/logger";
import { logNavigation } from "@/lib/navigation-log";
import { ErrorCard } from "@/components/error-card";

const ANALYSIS_STEPS = [
  { id: "read", label: "Lecture…", icon: BookOpen },
  { id: "parse", label: "Analyse des blocs…", icon: FileCode2 },
  { id: "validate", label: "Validation…", icon: CheckCircle2 },
] as const;

function mapProgressToStep(message: string): number {
  const m = message.toLowerCase();
  if (m.includes("validation") || m.includes("sqlite") || m.includes("sauvegarde")) return 2;
  if (m.includes("bloc") || m.includes("markdown") || m.includes("ollama") || m.includes("compréhension")) return 1;
  return 0;
}

export function ImportPage() {
  const navigate = useNavigate();
  const [rawText, setRawText] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [progressStep, setProgressStep] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<{ message: string; logs: string } | null>(null);
  const [pasted, setPasted] = useState(false);
  const didNavigate = useRef(false);

  const charCount = rawText.length;

  async function handleParse() {
    if (!rawText.trim()) return;
    setLoading(true);
    setError(null);
    setProgressStep(0.05);
    setActiveStep(0);

    try {
      const result = await parseWorkout(rawText, (msg) => {
        setProgress(msg);
        setProgressStep((s) => Math.min(0.95, s + 0.25));
        setActiveStep(mapProgressToStep(msg));
      });
      setProgressStep(1);
      setActiveStep(2);
      await new Promise((r) => setTimeout(r, 400));
      if (didNavigate.current) return;
      didNavigate.current = true;
      const dest = `/workout/${result.sessionId}`;
      logNavigation(window.location.pathname, dest, "import: parse terminé");
      navigate(dest);
    } catch (e) {
      const err = e as Error & { code?: string; details?: unknown };
      const message =
        err.message ||
        (typeof err.details === "string" ? err.details : "Erreur d'analyse.");
      clientLogger.error("import", `❌ ${message}`, e);
      setError({ message, logs: clientLogger.exportText() });
    } finally {
      setLoading(false);
    }
  }

  function handlePaste() {
    setPasted(true);
    setTimeout(() => setPasted(false), 600);
  }

  if (error) {
    return (
      <ErrorCard
        title="Analyse impossible"
        message={error.message}
        logs={error.logs}
        onRetry={() => {
          setError(null);
          void handleParse();
        }}
        onBack={() => navigate("/")}
      />
    );
  }

  return (
    <Screen>
      <Header
        title="Importer"
        subtitle="Format Markdown officiel"
        left={
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
        }
      />

      <main className="flex min-h-0 flex-1 flex-col gap-4">
        <motion.div
          className="relative flex min-h-0 flex-1 flex-col"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card padding="none" className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-cali-border px-4 py-3">
              <div className="flex items-center gap-2 text-cali-text-muted">
                <ClipboardPaste className="h-4 w-4" />
                <span className="cali-text-label">Zone de collage</span>
              </div>
              <span className="cali-text-caption text-cali-text-muted tabular-nums">
                {charCount > 0 ? `${charCount} car.` : "—"}
              </span>
            </div>

            <motion.div
              className="relative flex min-h-0 flex-1 flex-col p-4"
              animate={pasted ? { scale: [1, 1.01, 1] } : {}}
              transition={{ duration: 0.35 }}
            >
              <textarea
                className="min-h-[16rem] w-full flex-1 resize-none bg-transparent cali-text-caption leading-relaxed text-cali-text outline-none placeholder:text-cali-text-muted/40"
                placeholder={OFFICIAL_WORKOUT_TEMPLATE}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                onPaste={handlePaste}
                disabled={loading}
              />
            </motion.div>

            <AnimatePresence>
              {loading && (
                <motion.div
                  className="border-t border-cali-border bg-cali-bg-elevated/50 px-4 py-4 space-y-4"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-cali-accent/15"
                      animate={{ rotate: [0, 8, -8, 0] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    >
                      <FileCode2 className="h-5 w-5 text-cali-accent" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <Text variant="caption" className="font-medium">
                        {progress || "Analyse de la séance…"}
                      </Text>
                      <ProgressBar value={progressStep} max={1} className="mt-2" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {ANALYSIS_STEPS.map((step, i) => {
                      const Icon = step.icon;
                      const done = i < activeStep;
                      const current = i === activeStep;
                      return (
                        <motion.div
                          key={step.id}
                          className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
                            current
                              ? "bg-cali-accent/15 text-cali-accent"
                              : done
                                ? "bg-cali-success/10 text-cali-success"
                                : "bg-white/5 text-cali-text-muted"
                          }`}
                          animate={current ? { scale: [1, 1.02, 1] } : {}}
                          transition={{ repeat: current ? Infinity : 0, duration: 1.2 }}
                        >
                          <Icon className="h-3.5 w-3.5 shrink-0" />
                          <span className="cali-text-caption truncate">{step.label}</span>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>

        <Button
          fullWidth
          size="lg"
          loading={loading}
          disabled={!rawText.trim()}
          onClick={() => void handleParse()}
          className="shrink-0 shadow-[0_4px_24px_rgba(59,130,246,0.35)]"
        >
          <FileCode2 className="h-5 w-5" />
          Importer la séance
        </Button>
      </main>
    </Screen>
  );
}
