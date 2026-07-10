"use client";

import { motion } from "framer-motion";
import { useId, useMemo, useState } from "react";
import { formatEur } from "@/lib/margeo/utils";

interface EarningsChartProps {
  data: { day: string; net: number }[];
  height?: number;
}

const W = 720;
const PAD_X = 8;
const PAD_TOP = 16;
const PAD_BOTTOM = 28;

/** Graphique d'évolution des gains nets — SVG maison, zéro dépendance. */
export function EarningsChart({ data, height = 220 }: EarningsChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const gradientId = useId().replace(/:/g, "");

  const { points, areaPath, linePath, max } = useMemo(() => {
    const maxVal = Math.max(...data.map((d) => d.net), 0.01) * 1.15;
    const innerW = W - PAD_X * 2;
    const innerH = height - PAD_TOP - PAD_BOTTOM;
    const pts = data.map((d, i) => ({
      x: PAD_X + (i / Math.max(data.length - 1, 1)) * innerW,
      y: PAD_TOP + innerH * (1 - d.net / maxVal),
      ...d,
    }));

    const line = pts
      .map((p, i) => {
        if (i === 0) return `M ${p.x} ${p.y}`;
        const prev = pts[i - 1];
        const cx = (prev.x + p.x) / 2;
        return `C ${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y}`;
      })
      .join(" ");

    const area = `${line} L ${pts[pts.length - 1].x} ${
      height - PAD_BOTTOM
    } L ${pts[0].x} ${height - PAD_BOTTOM} Z`;

    return { points: pts, areaPath: area, linePath: line, max: maxVal };
  }, [data, height]);

  const active = hovered !== null ? points[hovered] : null;
  const hasData = data.some((d) => d.net > 0);

  if (!hasData) {
    return (
      <div className="flex h-[180px] flex-col items-center justify-center rounded-xl border border-dashed border-mg-border bg-mg-surface/50 text-center">
        <p className="text-sm text-mg-muted">Pas encore de données</p>
        <p className="mt-1 text-xs text-mg-faint">
          Le graphique se remplira après tes premières analyses.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full touch-pan-y">
      <svg
        viewBox={`0 0 ${W} ${height}`}
        className="w-full"
        role="img"
        aria-label="Graphique des gains nets sur 14 jours"
        onMouseLeave={() => setHovered(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(52,211,153,0.28)" />
            <stop offset="100%" stopColor="rgba(52,211,153,0)" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75].map((r) => (
          <line
            key={r}
            x1={PAD_X}
            x2={W - PAD_X}
            y1={PAD_TOP + (height - PAD_TOP - PAD_BOTTOM) * r}
            y2={PAD_TOP + (height - PAD_TOP - PAD_BOTTOM) * r}
            stroke="rgba(255,255,255,0.05)"
            strokeDasharray="4 6"
          />
        ))}

        <motion.path
          d={areaPath}
          fill={`url(#${gradientId})`}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.4 }}
        />
        <motion.path
          d={linePath}
          fill="none"
          stroke="var(--color-mg-go)"
          strokeWidth={2.5}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.6, ease: "easeInOut" }}
          style={{ filter: "drop-shadow(0 0 8px rgba(52,211,153,0.4))" }}
        />

        {points.map((p, i) => (
          <g key={i}>
            <rect
              x={p.x - (W - PAD_X * 2) / data.length / 2}
              y={0}
              width={(W - PAD_X * 2) / data.length}
              height={height}
              fill="transparent"
              onMouseEnter={() => setHovered(i)}
              onTouchStart={() => setHovered(i)}
            />
            <text
              x={p.x}
              y={height - 8}
              textAnchor="middle"
              className="fill-mg-faint text-[11px]"
              fill="var(--color-mg-faint)"
            >
              {p.day}
            </text>
          </g>
        ))}

        {active && (
          <g pointerEvents="none">
            <line
              x1={active.x}
              x2={active.x}
              y1={PAD_TOP}
              y2={height - PAD_BOTTOM}
              stroke="rgba(255,255,255,0.15)"
            />
            <circle
              cx={active.x}
              cy={active.y}
              r={5}
              fill="var(--color-mg-go)"
              stroke="#09090b"
              strokeWidth={2}
            />
          </g>
        )}

        <text
          x={PAD_X}
          y={12}
          className="fill-mg-faint text-[10px]"
          fill="var(--color-mg-faint)"
        >
          {formatEur(max)}
        </text>
      </svg>

      {active && (
        <div
          className="pointer-events-none absolute -top-1 z-10 -translate-x-1/2 rounded-lg border border-mg-border bg-mg-surface px-3 py-1.5 text-xs shadow-mg-card"
          style={{ left: `${(active.x / W) * 100}%` }}
        >
          <span className="text-mg-muted">{active.day} · </span>
          <span className="font-semibold text-mg-foreground">
            {formatEur(active.net)}
          </span>
        </div>
      )}
    </div>
  );
}
