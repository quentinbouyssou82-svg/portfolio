import type { ReactNode } from "react";
import type { ApexVisualConfig } from "@/lib/apex-advisory/visuals";
import { ApexVisual } from "./apex-visual";

export type ApexTimelineStep = {
  id: string;
  num: string;
  title: ReactNode;
  body: ReactNode;
  visual?: ApexVisualConfig;
};

type ApexTimelineProps = {
  steps: ApexTimelineStep[];
  className?: string;
};

/** Timeline unique — structure, styles et scroll identiques partout. */
export function ApexTimeline({ steps, className }: ApexTimelineProps) {
  return (
    <div className={["ax-timeline", className].filter(Boolean).join(" ")} data-ax-timeline>
      <div className="ax-timeline-rail" aria-hidden>
        <div className="ax-timeline-track" />
        <div className="ax-timeline-fill" data-ax-timeline-fill />
        <div className="ax-timeline-energy" aria-hidden />
        <div className="ax-timeline-pointer" data-ax-timeline-pointer />
      </div>

      {steps.map((step) => (
        <div key={step.id} data-ax-timeline-step className="ax-timeline-step">
          <div className="ax-timeline-dot-wrap">
            <div className="ax-timeline-dot" aria-hidden />
          </div>
          <article className="ax-audience-card">
            <div className="ax-timeline-card-head">
              {step.visual ? (
                <ApexVisual
                  visual={step.visual}
                  variant="thumb"
                  className="ax-timeline-step-visual hidden sm:block"
                  parallax={false}
                />
              ) : null}
              <div className="ax-timeline-card-copy">
                <span className="ax-label text-[0.5rem]">{step.num}</span>
                <h3
                  data-ax-gold-scroll
                  className="ax-audience-card-title font-display mt-3 text-[1.35rem] tracking-[0.01em] md:text-[1.5rem]"
                >
                  {step.title}
                </h3>
              </div>
            </div>
            <div className="ax-timeline-card-body ax-body-sm mt-3 max-w-2xl normal-case tracking-normal">
              {step.body}
            </div>
          </article>
        </div>
      ))}
    </div>
  );
}
