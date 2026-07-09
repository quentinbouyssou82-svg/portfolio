import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { APEX_EASE, APEX_SCROLL } from "@/lib/apex-advisory/motion";

/** Scroll + mapping — config unique pour toutes les timelines. */
export const TIMELINE_SCROLL = {
  start: "top 78%",
  end: "bottom 22%",
  scrub: APEX_SCROLL.scrubTimeline,
  /** Micro-pause (0–1) au début de chaque segment physique — très légère. */
  snapDwell: 0.035,
} as const;

type TimelineDotAnchor = {
  dot: HTMLElement;
  step: HTMLElement;
  /** Centre du dot, en px depuis le haut du fill (origine du rail drawable). */
  offset: number;
};

function measureTimelineDots(timeline: HTMLElement, fill: HTMLElement): TimelineDotAnchor[] {
  const originY = fill.getBoundingClientRect().top;

  return Array.from(timeline.querySelectorAll<HTMLElement>("[data-ax-timeline-step]")).map((step) => {
    const dot = step.querySelector<HTMLElement>(".ax-timeline-dot");
    if (!dot) {
      return { dot: document.createElement("span"), step, offset: 0 };
    }

    const dotRect = dot.getBoundingClientRect();
    const offset = dotRect.top + dotRect.height / 2 - originY;
    return { dot, step, offset: Math.max(0, offset) };
  });
}

/**
 * Progresse le long du rail en fonction des distances physiques réelles :
 * stops[0] → … → stops[n-1] → travel (bas du fill).
 * Le scroll progress 0/1 couvre 100 % du chemin drawable, pas des segments égaux par step.
 */
function mapPointerAlongPath(raw: number, stops: number[], travel: number, dwell: number): number {
  if (travel <= 0) return 0;

  const clamped = Math.min(1, Math.max(0, raw));
  if (stops.length === 0) return clamped * travel;

  const path: number[] = [stops[0]];
  for (let i = 1; i < stops.length; i++) {
    if (stops[i] > path[path.length - 1] + 0.5) {
      path.push(stops[i]);
    }
  }
  if (travel > path[path.length - 1] + 0.5) {
    path.push(travel);
  }

  if (path.length === 1) {
    return path[0] + (travel - path[0]) * clamped;
  }

  const segLens = path.slice(1).map((y, i) => y - path[i]);
  const total = segLens.reduce((a, b) => a + b, 0);
  if (total <= 0) return path[0];

  let remaining = clamped * total;

  for (let i = 0; i < segLens.length; i++) {
    const len = segLens[i];
    const from = path[i];
    const to = path[i + 1];

    if (remaining <= len || i === segLens.length - 1) {
      const t = len > 0 ? Math.min(1, remaining / len) : 1;
      const eased = applySoftDwell(t, dwell);
      return from + (to - from) * eased;
    }
    remaining -= len;
  }

  return travel;
}

function applySoftDwell(t: number, dwell: number): number {
  if (dwell <= 0) return t;
  if (t <= dwell) return 0;
  const move = (t - dwell) / (1 - dwell);
  return gsap.parseEase(APEX_EASE.inOutSoft)(Math.min(1, Math.max(0, move)));
}

export function initTimelineScroll(timeline: HTMLElement, reduced: boolean) {
  const fill = timeline.querySelector<HTMLElement>("[data-ax-timeline-fill]");
  const pointer = timeline.querySelector<HTMLElement>("[data-ax-timeline-pointer]");
  if (!fill) return;

  let anchors = measureTimelineDots(timeline, fill);

  const remeasureAnchors = () => {
    anchors = measureTimelineDots(timeline, fill);
  };

  const applyProgress = (rawProgress: number) => {
    const travel = fill.offsetHeight;
    if (travel <= 0) return;

    const stops = anchors.map((a) => a.offset);
    const pointerY = mapPointerAlongPath(rawProgress, stops, travel, TIMELINE_SCROLL.snapDwell);
    const fillProgress = Math.min(1, Math.max(0, pointerY / travel));

    fill.style.setProperty("--ax-path-progress", String(fillProgress));
    if (pointer) {
      pointer.style.setProperty("--ax-pointer-y", `${pointerY}px`);
    }

    let activeIndex = 0;
    let bestDist = Infinity;
    anchors.forEach(({ offset }, i) => {
      const dist = Math.abs(pointerY - offset);
      if (dist < bestDist) {
        bestDist = dist;
        activeIndex = i;
      }
    });

    anchors.forEach(({ dot, step, offset }, i) => {
      const lit = pointerY >= offset - 2;
      dot.classList.toggle("is-lit", lit);
      step.classList.toggle("is-active", i === activeIndex);
      step.classList.toggle("is-passed", pointerY > offset + 4 && i !== activeIndex);
    });
  };

  if (reduced) {
    applyProgress(1);
    return;
  }

  let refreshQueued = false;

  const queueScrollTriggerRefresh = () => {
    if (refreshQueued) return;
    refreshQueued = true;
    requestAnimationFrame(() => {
      refreshQueued = false;
      ScrollTrigger.refresh();
    });
  };

  const st = ScrollTrigger.create({
    trigger: timeline,
    start: TIMELINE_SCROLL.start,
    end: TIMELINE_SCROLL.end,
    scrub: TIMELINE_SCROLL.scrub,
    invalidateOnRefresh: true,
    onUpdate: (self) => applyProgress(self.progress),
    onRefresh: (self) => {
      remeasureAnchors();
      applyProgress(self.progress);
    },
  });

  applyProgress(st.progress);

  let resizeFrame = 0;
  const ro = new ResizeObserver(() => {
    if (resizeFrame) cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      resizeFrame = 0;
      remeasureAnchors();
      applyProgress(st.progress);
      queueScrollTriggerRefresh();
    });
  });
  ro.observe(timeline);

  return () => {
    ro.disconnect();
    if (resizeFrame) cancelAnimationFrame(resizeFrame);
    st.kill();
    fill.style.removeProperty("--ax-path-progress");
    if (pointer) pointer.style.removeProperty("--ax-pointer-y");
    anchors.forEach(({ dot, step }) => {
      dot.classList.remove("is-lit");
      step.classList.remove("is-active", "is-passed");
    });
  };
}
