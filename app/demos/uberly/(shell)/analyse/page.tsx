"use client";

import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw, ScanLine, Sparkles, X, Check } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AnalysisResult } from "@/components/margeo/analyse/analysis-result";
import { FeedbackForm } from "@/components/margeo/analyse/feedback-form";
import {
  ScanOverlay,
  SCAN_DURATION_MS,
} from "@/components/margeo/analyse/scan-overlay";
import { UploadZone } from "@/components/margeo/analyse/upload-zone";
import { LocationBanner } from "@/components/margeo/location-banner";
import { Button } from "@/components/margeo/ui/button";
import { useGeolocation } from "@/hooks/margeo/use-geolocation";
import {
  maybeMarkActiveUser,
  trackMargeoEvent,
} from "@/lib/margeo/analytics";
import { getAnalysisErrorMessage } from "@/lib/margeo/analyse-errors";
import type { AnalysisMeta } from "@/lib/margeo/analyse-meta";
import { VERDICT_META, type RideAnalysis } from "@/lib/margeo/types";

type Stage = "idle" | "scanning" | "result";

const STAGE_LABELS: Record<Stage, string> = {
  idle: "Capture",
  scanning: "Analyse",
  result: "Verdict",
};

const STAGE_ORDER: Stage[] = ["idle", "scanning", "result"];

export default function AnalysePage() {
  const searchParams = useSearchParams();
  const [showWelcome, setShowWelcome] = useState(
    () => searchParams.get("welcome") === "1",
  );
  const [stage, setStage] = useState<Stage>("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<RideAnalysis | null>(null);
  const [analysisMeta, setAnalysisMeta] = useState<AnalysisMeta | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const geo = useGeolocation();

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const runAnalysis = useCallback(
    async (file: File, url: string | null) => {
      setPreviewUrl(url);
      setStage("scanning");

      const minDelay = new Promise((r) => setTimeout(r, SCAN_DURATION_MS));

      try {
        const formData = new FormData();
        formData.append("image", file);
        if (geo.position) {
          formData.append("courierLat", String(geo.position.lat));
          formData.append("courierLng", String(geo.position.lng));
        }

        const [res] = await Promise.all([
          fetch("/api/uberly/analyze", { method: "POST", body: formData }),
          minDelay,
        ]);

        const data = await res.json();

        if (!res.ok) {
          throw { message: data.error, code: data.code };
        }

        setAnalysis(data.analysis as RideAnalysis);
        setAnalysisMeta({
          confidence: data.confidence,
          warnings: data.warnings,
          missingFields: data.missingFields,
          extractionQuality: data.extractionQuality,
          source: data.source,
        });
        setStage("result");

        trackMargeoEvent("margeo_image_uploaded", {
          source: data.source,
          platform: data.analysis.offer.platform,
        });
        trackMargeoEvent("margeo_result_displayed", {
          score: data.analysis.score,
          verdict: data.analysis.verdict,
        });

        if (data.isFirstAnalysis) {
          trackMargeoEvent("margeo_first_analysis");
        }

        maybeMarkActiveUser(data.analysisCount ?? 1, data.analysis.id);

        const meta = VERDICT_META[data.analysis.verdict as keyof typeof VERDICT_META];
        toast(`${meta.emoji} ${meta.label} — score ${data.analysis.score}/100`, {
          description: meta.description,
        });
      } catch (e) {
        setStage("idle");
        if (url) URL.revokeObjectURL(url);
        setPreviewUrl(null);
        const err = getAnalysisErrorMessage(e);
        toast.error(err.title, { description: err.description });
      }
    },
    [geo.position],
  );

  const handleUpload = useCallback(
    (url: string | null, file?: File) => {
      if (!file) return;
      void runAnalysis(file, url);
    },
    [runAnalysis],
  );

  const reset = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setAnalysis(null);
    setAnalysisMeta(null);
    setStage("idle");
  }, [previewUrl]);

  return (
    <div className="mx-auto max-w-3xl">
      <LocationBanner
        permission={geo.permission}
        loading={geo.loading}
        error={geo.error}
        onRequest={geo.requestLocation}
      />

      <AnimatePresence>
        {showWelcome && stage === "idle" && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-6 flex items-start gap-3 rounded-2xl border border-mg-go/30 bg-mg-go-soft p-4"
          >
            <Sparkles className="mt-0.5 size-4 shrink-0 text-mg-go" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-mg-foreground">
                Profil prêt — analyse ta première course !
              </p>
              <p className="mt-0.5 text-xs text-mg-muted">
                Dépose une capture et reçois ton verdict en moins de 10
                secondes.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowWelcome(false)}
              className="flex size-11 shrink-0 items-center justify-center rounded-lg text-mg-faint transition-colors hover:text-mg-foreground"
              aria-label="Fermer"
            >
              <X className="size-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-8 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-mg-accent/25 bg-mg-accent-soft px-3 py-1 text-xs font-medium text-mg-accent">
          <ScanLine className="size-3.5" />
          Analyse IA · Uberly
        </span>

        {stage !== "idle" && (
          <div className="mx-auto mt-5 flex max-w-xs items-center justify-center gap-2">
            {STAGE_ORDER.map((s, i) => {
              const current = STAGE_ORDER.indexOf(stage);
              const done = i < current;
              const active = s === stage;
              return (
                <div key={s} className="flex items-center gap-2">
                  <span
                    className={`flex size-6 items-center justify-center rounded-full text-[10px] font-bold transition-colors ${
                      done
                        ? "bg-mg-go text-[#04120c]"
                        : active
                          ? "bg-mg-accent text-[#04120c]"
                          : "border border-mg-border text-mg-faint"
                    }`}
                  >
                    {done ? <Check className="size-3" /> : i + 1}
                  </span>
                  <span
                    className={`hidden text-xs sm:inline ${
                      active ? "font-medium text-mg-foreground" : "text-mg-faint"
                    }`}
                  >
                    {STAGE_LABELS[s]}
                  </span>
                  {i < STAGE_ORDER.length - 1 && (
                    <span className="h-px w-4 bg-mg-border sm:w-6" />
                  )}
                </div>
              );
            })}
          </div>
        )}

        <h1 className="mt-4 text-2xl font-bold tracking-tight text-mg-foreground sm:text-3xl">
          {stage === "result"
            ? "Verdict de ta course"
            : "Analyse une proposition de course"}
        </h1>
        {stage === "idle" && (
          <p className="mx-auto mt-2 max-w-md text-sm text-mg-muted">
            Dépose la capture d&apos;écran. Uberly extrait les données, calcule
            ta rentabilité réelle et te recommande quoi faire.
          </p>
        )}
      </div>

      <AnimatePresence mode="wait">
        {stage === "idle" && (
          <motion.div key="idle" exit={{ opacity: 0, y: -12 }}>
            <UploadZone onUpload={handleUpload} />
          </motion.div>
        )}

        {stage === "scanning" && (
          <ScanOverlay key="scanning" previewUrl={previewUrl} />
        )}

        {stage === "result" && analysis && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            <AnalysisResult
              analysis={analysis}
              meta={analysisMeta ?? undefined}
            />
            <div className="mt-6">
              <FeedbackForm analysis={analysis} />
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button variant="secondary" onClick={reset} className="min-h-11">
                <RotateCcw />
                Analyser une autre course
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
