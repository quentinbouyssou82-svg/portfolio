"use client";

import { RotateCcw, ScanLine, Sparkles, X, Check } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AnalysisResult } from "@/components/margeo/analyse/analysis-result";
import { FeedbackForm } from "@/components/margeo/analyse/feedback-form";
import {
  ScanOverlay,
} from "@/components/margeo/analyse/scan-overlay";
import { UploadZone } from "@/components/margeo/analyse/upload-zone";
import { LocationBanner } from "@/components/margeo/location-banner";
import { useDriveelyProfile } from "@/components/margeo/profile-context";
import { Button } from "@/components/margeo/ui/button";
import { ErrorState } from "@/components/margeo/ui/error-state";
import { useGeolocation } from "@/hooks/margeo/use-geolocation";
import {
  maybeMarkActiveUser,
  trackMargeoEvent,
} from "@/lib/margeo/analytics";
import { getAnalysisErrorMessage } from "@/lib/margeo/analyse-errors";
import type { AnalysisMeta } from "@/lib/margeo/analyse-meta";
import { VERDICT_META, type RideAnalysis } from "@/lib/margeo/types";
import { cn } from "@/lib/margeo/utils";

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
  const [uploadError, setUploadError] = useState<{
    title: string;
    description?: string;
  } | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const profile = useDriveelyProfile();
  const geo = useGeolocation({
    lat: profile.lastLat,
    lng: profile.lastLng,
    permission: profile.locationPermission,
  });

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const runAnalysis = useCallback(
    async (file: File, url: string | null) => {
      setUploadError(null);
      setPreviewUrl(url);
      setStage("scanning");

      // Pas d'attente artificielle : le verdict s'affiche dès la réponse API.
      try {
        const formData = new FormData();
        formData.append("image", file);
        if (geo.position) {
          formData.append("courierLat", String(geo.position.lat));
          formData.append("courierLng", String(geo.position.lng));
        }

        const res = await fetch("/api/driveely/analyze", {
          method: "POST",
          body: formData,
        });

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
        toast(`${meta.label} — ${data.analysis.score}/100`, {
          description: meta.description,
        });
      } catch (e) {
        setStage("idle");
        if (url) URL.revokeObjectURL(url);
        setPreviewUrl(null);
        const err = getAnalysisErrorMessage(e);
        setUploadError({ title: err.title, description: err.description });
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
    setUploadError(null);
    setStage("idle");
  }, [previewUrl]);

  const currentStageIndex = STAGE_ORDER.indexOf(stage);

  return (
    <div className="app-page mx-auto max-w-3xl">
      <LocationBanner
        permission={geo.permission}
        loading={geo.loading}
        error={geo.error}
        onRequest={geo.requestLocation}
      />

      {showWelcome && stage === "idle" && (
        <div className="app-fade-in flex items-start gap-3 rounded-2xl border border-mg-go/25 bg-mg-go-soft p-4">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-mg-go" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-mg-foreground">
              Profil prêt
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-mg-muted">
              Dépose ta première capture. Verdict en 8 secondes.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowWelcome(false)}
            className="flex size-11 shrink-0 items-center justify-center rounded-xl text-mg-faint transition-colors hover:text-mg-foreground"
            aria-label="Fermer"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      <header className="app-page-header text-center">
        <span className="app-page-eyebrow mx-auto inline-flex items-center gap-2 rounded-full border border-mg-accent/20 bg-mg-accent-soft px-3 py-1 normal-case tracking-normal text-mg-accent">
          <ScanLine className="size-3.5" />
          Analyse IA · Driveely
        </span>

        {stage !== "idle" && (
          <div className="app-stage-steps mx-auto mt-4 max-w-xs">
            {STAGE_ORDER.map((s, i) => {
              const done = i < currentStageIndex;
              const active = s === stage;
              return (
                <div key={s} className="flex items-center gap-2">
                  <span
                    className={cn(
                      "app-stage-dot",
                      done && "app-stage-dot-done",
                      active && "app-stage-dot-active",
                      !done && !active && "app-stage-dot-idle",
                    )}
                  >
                    {done ? <Check className="size-3" /> : i + 1}
                  </span>
                  <span
                    className={cn(
                      "hidden text-xs sm:inline",
                      active ? "font-medium text-mg-foreground" : "text-mg-faint",
                    )}
                  >
                    {STAGE_LABELS[s]}
                  </span>
                  {i < STAGE_ORDER.length - 1 && (
                    <span className="app-stage-line hidden sm:block" />
                  )}
                </div>
              );
            })}
          </div>
        )}

        <h1 className="app-page-title mt-4">
          {stage === "result"
            ? "Ton verdict"
            : "Analyser une course"}
        </h1>
        {stage === "idle" && (
          <p className="app-page-desc mx-auto mt-2 max-w-md">
            Capture → gain net → verdict. Avant la fin du compte à rebours.
          </p>
        )}
      </header>

      {stage === "idle" && uploadError && (
        <ErrorState
          title={uploadError.title}
          description={uploadError.description}
          onRetry={() => setUploadError(null)}
        />
      )}

      {stage === "idle" && <UploadZone onUpload={handleUpload} />}

      {stage === "scanning" && (
        <ScanOverlay previewUrl={previewUrl} />
      )}

      {stage === "result" && analysis && (
        <div className="space-y-5">
          <AnalysisResult
            analysis={analysis}
            meta={analysisMeta ?? undefined}
          />
          <FeedbackForm analysis={analysis} />
          <div className="flex justify-center pb-2">
            <Button variant="secondary" size="lg" onClick={reset}>
              <RotateCcw />
              Analyser une autre
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
