"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-motion-prefs";
import { ApexHeroFlagBadge, type ApexHeroFlagId } from "./apex-hero-flags";
import { useApexLocale } from "./apex-locale-provider";

type PanelItem = {
  flag: ApexHeroFlagId;
  value: string;
  label: string;
  countUp?: number;
};

function useCountUp(target: number, active: boolean, duration = 1100) {
  const reduced = usePrefersReducedMotion();
  const [value, setValue] = useState(reduced ? target : 0);

  useEffect(() => {
    if (reduced) {
      setValue(target);
      return;
    }

    if (!active) {
      setValue(0);
      return;
    }

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, duration, reduced, target]);

  return value;
}

function PanelValue({ item, index }: { item: PanelItem; index: number }) {
  const reduced = usePrefersReducedMotion();
  const [active, setActive] = useState(reduced);
  const count = useCountUp(item.countUp ?? 0, active);

  useEffect(() => {
    if (reduced || item.countUp == null) return;
    const delay = 620 + index * 110;
    const timer = window.setTimeout(() => setActive(true), delay);
    return () => window.clearTimeout(timer);
  }, [index, item.countUp, reduced]);

  if (item.countUp != null) {
    return (
      <span className="ax-hero-panel-value">
        <span className="ax-hero-panel-count" aria-hidden>
          {count}
        </span>
        <span className="sr-only">{item.countUp}</span> {item.value}
      </span>
    );
  }

  return <span className="ax-hero-panel-value">{item.value}</span>;
}

export function ApexHeroPanel() {
  const { t } = useApexLocale();
  const { heroPanel } = t;
  const panelItems: PanelItem[] = heroPanel.items.map((item) => ({
    flag: item.flag,
    value: item.value,
    label: item.label,
    countUp: item.countUp,
  }));

  return (
    <div className="ax-hero-panel ax-fade-up min-w-0 hidden lg:block" style={{ "--ax-i": 6 } as CSSProperties}>
      <div className="ax-hero-panel-shimmer" aria-hidden />
      <div className="ax-hero-panel-dots" aria-hidden />

      <div className="ax-hero-panel-head">
        <p className="ax-label">{heroPanel.glance}</p>
        <span className="ax-hero-panel-pulse" aria-hidden />
      </div>

      <div className="ax-hero-panel-grid mt-8">
        {panelItems.map((item, i) => (
          <div
            key={item.flag}
            className="ax-hero-panel-stat"
            style={{ "--ax-panel-i": i } as CSSProperties}
          >
            <div className="ax-hero-panel-stat-inner">
              <div className="ax-hero-panel-value-row">
                <span className="ax-hero-panel-badge">
                  <ApexHeroFlagBadge id={item.flag} className="ax-hero-panel-flag" />
                </span>
                <PanelValue item={item} index={i} />
              </div>
              <span className="ax-body-sm ax-hero-panel-label">{item.label}</span>
            </div>
          </div>
        ))}
      </div>

      <p className="ax-body-sm ax-hero-panel-foot mt-8">{heroPanel.foot}</p>
    </div>
  );
}
