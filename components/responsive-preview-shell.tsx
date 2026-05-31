"use client";

import { Monitor, Smartphone, Tablet } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";
import {
  isPreviewFrame,
  PREVIEW_WIDTHS,
  useResponsivePreview,
  type PreviewMode,
} from "@/hooks/use-responsive-preview";
import { isResponsivePreviewAvailable } from "@/lib/responsive-preview-config";
import { cn } from "@/lib/utils";

const previewEnabled = isResponsivePreviewAvailable();

function PreviewToolbar({
  mode,
  setMode,
}: {
  mode: PreviewMode;
  setMode: (mode: PreviewMode) => void;
}) {
  const options: { id: PreviewMode; label: string; icon: typeof Monitor }[] = [
    { id: "full", label: "Desktop", icon: Monitor },
    { id: "tablet", label: "Tablette", icon: Tablet },
    { id: "mobile", label: "Mobile", icon: Smartphone },
  ];

  return (
    <div
      className="responsive-preview-toolbar fixed bottom-5 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-1 rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)]/95 p-1.5 shadow-2xl backdrop-blur-md"
      role="toolbar"
      aria-label="Simulation responsive"
    >
      {options.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => setMode(id)}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-all",
            mode === id
              ? "bg-[var(--foreground)] text-[var(--background)]"
              : "text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]",
          )}
          aria-pressed={mode === id}
        >
          <Icon className="size-3.5" aria-hidden />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}

function PreviewFrame({ mode }: { mode: Exclude<PreviewMode, "full"> }) {
  const src = useMemo(() => {
    if (typeof window === "undefined") return "/?preview-frame=1";
    const url = new URL(window.location.href);
    url.searchParams.set("preview-frame", "1");
    return url.pathname + url.search;
  }, []);

  const width = PREVIEW_WIDTHS[mode];

  return (
    <div className="responsive-preview-workbench fixed inset-0 z-[90] flex flex-col items-center overflow-auto bg-[#0d0d12] px-4 pb-24 pt-6">
      <div className="mb-4 flex items-center gap-3 text-xs text-white/60">
        <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">
          {mode === "mobile" ? "iPhone · 390px" : "iPad · 834px"}
        </span>
        <span>Les breakpoints réels s&apos;appliquent dans le cadre</span>
      </div>
      <div
        className="responsive-preview-device relative shrink-0 overflow-hidden rounded-[2rem] border border-white/15 bg-[var(--background)] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.65)]"
        style={{ width }}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center pt-2">
          <div className="h-1 w-16 rounded-full bg-black/20" aria-hidden />
        </div>
        <iframe
          title={`Aperçu ${mode}`}
          src={src}
          className="block w-full border-0"
          style={{ height: "min(90vh, 844px)", minHeight: "640px" }}
        />
      </div>
    </div>
  );
}

function ResponsivePreviewInner({ children }: { children: React.ReactNode }) {
  const { mode, setMode, mounted } = useResponsivePreview();
  const searchParams = useSearchParams();
  const inFrame = searchParams.has("preview-frame") || isPreviewFrame();

  if (!previewEnabled) {
    return <>{children}</>;
  }

  if (inFrame) {
    return <>{children}</>;
  }

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <>
      {mode === "full" ? children : null}
      {mode === "mobile" || mode === "tablet" ? <PreviewFrame mode={mode} /> : null}
      <PreviewToolbar mode={mode} setMode={setMode} />
    </>
  );
}

export function ResponsivePreviewShell({ children }: { children: React.ReactNode }) {
  if (!previewEnabled) {
    return <>{children}</>;
  }

  return (
    <Suspense fallback={children}>
      <ResponsivePreviewInner>{children}</ResponsivePreviewInner>
    </Suspense>
  );
}
