import type { LiveStats } from "@cali/stats-engine";
import { formatDuration } from "@cali/utils/session";
import { Card, Text } from "@cali/ui";

interface LiveStatsBarProps {
  stats: LiveStats | null;
  elapsedSeconds: number;
  estimatedRemainingSeconds: number;
}

export function LiveStatsBar({
  stats,
  elapsedSeconds,
  estimatedRemainingSeconds,
}: LiveStatsBarProps) {
  if (!stats) return null;

  const items = [
    { label: "Reps", value: String(stats.totalReps), highlight: true },
    { label: "Volume", value: `${Math.round(stats.totalVolumeKg)}` },
    { label: "Actif", value: formatDuration(elapsedSeconds) },
    { label: "Reste", value: formatDuration(estimatedRemainingSeconds) },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {items.map((item) => (
        <Card key={item.label} padding="sm" className="!shadow-cali-sm text-center">
          <Text variant="label" muted className="!text-[0.625rem]">
            {item.label}
          </Text>
          <p
            className={`mt-1 cali-text-caption font-bold tabular-nums ${
              item.highlight ? "text-cali-accent" : "text-cali-text"
            }`}
          >
            {item.value}
          </p>
        </Card>
      ))}
    </div>
  );
}
