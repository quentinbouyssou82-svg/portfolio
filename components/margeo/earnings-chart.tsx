"use client";

import { motion } from "framer-motion";
import { useId, useMemo, useState } from "react";
import { formatEur } from "@/lib/margeo/utils";

interface EarningsChartProps {
  data: { day: string; net: number }[];
  height?: number;
}

const W = 720;
const PAD_X = 12;
const PAD_TOP = 18;
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
  /** Sur mobile étroit : 1 label sur 2 pour éviter le chevauchement. */
  const labelStep = data.length > 10 ? 2 : 1;

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
    <div
      className="earnings-chart relative w-full min-w-0 touch-pan-y overflow-visible"
      style={{ aspectRatio: `${W} / ${height}` }}
    >
      <svg
        viewBox={`0 0 ${W} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className="block h-full w-full"
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
          transition={{ duration: 0.8, delay: 0.15 }}
        />
        {/* Trait statique — pathLength Safari iOS laisse parfois le trait invisible */}
        <motion.path
          d={linePath}
          fill="none"
          stroke="var(--color-mg-go)"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.25 }}
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
            {(i % labelStep === 0 || i === points.length - 1) && (
              <text
                x={p.x}
                y={height - 8}
                textAnchor="middle"
                className="fill-mg-faint"
                fill="var(--color-mg-faint)"
                fontSize={11}
              >
                {p.day}
              </text>
            )}
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
          fill="var(--color-mg-faint)"
          fontSize={10}
        >
          {formatEur(max)}
        </text>
      </svg>

      {active && (
        <div
          className="pointer-events-none absolute -top-1 z-10 max-w-[calc(100%-0.5rem)] -translate-x-1/2 rounded-lg border border-mg-border bg-mg-surface px-3 py-1.5 text-xs shadow-mg-card"
          style={{
            left: `${Math.min(92, Math.max(8, (active.x / W) * 100))}%`,
          }}
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
