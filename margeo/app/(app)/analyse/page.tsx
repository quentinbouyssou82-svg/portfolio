"use client";

import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw, ScanLine } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AnalysisResult } from "@/components/analyse/analysis-result";
import {
  ScanOverlay,
  SCAN_DURATION_MS,
} from "@/components/analyse/scan-overlay";
import { UploadZone } from "@/components/analyse/upload-zone";
import { Button } from "@/components/ui/button";
import { analyzeOffer } from "@/lib/engine";
import { DEMO_PROFILE, pickIncomingOffer } from "@/lib/data";
import { VERDICT_META, type RideAnalysis } from "@/lib/types";

type Stage = "idle" | "scanning" | "result";

export default function AnalysePage() {
  const [stage, setStage] = useState<Stage>("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<RideAnalysis | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const startAnalysis = useCallback((url: string | null) => {
    setPreviewUrl(url);
    setStage("scanning");

    timerRef.current = setTimeout(() => {
      const offer = pickIncomingOffer();
      const result = analyzeOffer(offer, DEMO_PROFILE);
      setAnalysis(result);
      setStage("result");

      const meta = VERDICT_META[result.verdict];
      toast(`${meta.emoji} ${meta.label} — score ${result.score}/100`, {
        description: meta.description,
      });
    }, SCAN_DURATION_MS);
  }, []);

  const reset = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setAnalysis(null);
    setStage("idle");
  }, [previewUrl]);

  return (
    <div className="mx-auto max-w-3xl">
      {/* En-tête */}
      <div className="mb-8 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent-soft px-3 py-1 text-xs font-medium text-accent">
          <ScanLine className="size-3.5" />
          Moteur d&apos;analyse v1
        </span>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {stage === "result"
            ? "Verdict de ta course"
            : "Analyse une proposition de course"}
        </h1>
        {stage === "idle" && (
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            Dépose la capture d&apos;écran de la proposition. Margeo calcule ton
            gain net réel et te dit quoi faire.
          </p>
        )}
      </div>

      <AnimatePresence mode="wait">
        {stage === "idle" && (
          <motion.div key="idle" exit={{ opacity: 0, y: -12 }}>
            <UploadZone onUpload={startAnalysis} />
          </motion.div>
        )}

        {stage === "scanning" && (
          <ScanOverlay key="scanning" previewUrl={previewUrl} />
        )}

        {stage === "result" && analysis && (
          <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <AnalysisResult analysis={analysis} />
            <div className="mt-6 flex justify-center">
              <Button variant="secondary" onClick={reset}>
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
