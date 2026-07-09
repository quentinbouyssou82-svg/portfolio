"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { formatEur } from "@/lib/utils";

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

  const { points, areaPath, linePath, max } = useMemo(() => {
    const max = Math.max(...data.map((d) => d.net)) * 1.15;
    const innerW = W - PAD_X * 2;
    const innerH = height - PAD_TOP - PAD_BOTTOM;
    const points = data.map((d, i) => ({
      x: PAD_X + (i / (data.length - 1)) * innerW,
      y: PAD_TOP + innerH * (1 - d.net / max),
      ...d,
    }));

    const line = points
      .map((p, i) => {
        if (i === 0) return `M ${p.x} ${p.y}`;
        const prev = points[i - 1];
        const cx = (prev.x + p.x) / 2;
        return `C ${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y}`;
      })
      .join(" ");

    const area = `${line} L ${points[points.length - 1].x} ${
      height - PAD_BOTTOM
    } L ${points[0].x} ${height - PAD_BOTTOM} Z`;

    return { points, areaPath: area, linePath: line, max };
  }, [data, height]);

  const active = hovered !== null ? points[hovered] : null;

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${W} ${height}`}
        className="w-full"
        onMouseLeave={() => setHovered(null)}
      >
        <defs>
          <linearGradient id="area-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(52,211,153,0.28)" />
            <stop offset="100%" stopColor="rgba(52,211,153,0)" />
          </linearGradient>
        </defs>

        {/* Lignes de repère horizontales */}
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
          fill="url(#area-fill)"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.4 }}
        />
        <motion.path
          d={linePath}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={2.5}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.6, ease: "easeInOut" }}
          style={{ filter: "drop-shadow(0 0 8px rgba(52,211,153,0.4))" }}
        />

        {/* Zones interactives + labels */}
        {points.map((p, i) => (
          <g key={i}>
            <rect
              x={p.x - (W - PAD_X * 2) / data.length / 2}
              y={0}
              width={(W - PAD_X * 2) / data.length}
              height={height}
              fill="transparent"
              onMouseEnter={() => setHovered(i)}
            />
            {i % 2 === 0 && (
              <text
                x={p.x}
                y={height - 8}
                textAnchor="middle"
                className="fill-faint text-[11px]"
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
              fill="var(--color-accent)"
              stroke="#09090b"
              strokeWidth={2}
            />
          </g>
        )}

        {/* Repère max */}
        <text x={PAD_X} y={12} className="fill-faint text-[10px]">
          {formatEur(max)}
        </text>
      </svg>

      {active && (
        <div
          className="pointer-events-none absolute -top-1 z-10 -translate-x-1/2 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs shadow-card"
          style={{ left: `${(active.x / W) * 100}%` }}
        >
          <span className="text-muted">{active.day} · </span>
          <span className="font-semibold text-foreground">
            {formatEur(active.net)}
          </span>
        </div>
      )}
    </div>
  );
}
