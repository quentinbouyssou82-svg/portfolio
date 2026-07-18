import { cn } from "@/lib/margeo/utils";
import { VERDICT_META, type Verdict } from "@/lib/margeo/types";

interface VerdictBadgeProps {
  verdict: Verdict;
  size?: "sm" | "md";
  className?: string;
}

export function VerdictBadge({
  verdict,
  size = "sm",
  className,
}: VerdictBadgeProps) {
  const meta = VERDICT_META[verdict];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-semibold leading-none app-fade-in",
        size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-sm",
        className
      )}
      style={{
        color: meta.color,
        backgroundColor: meta.softColor,
        borderColor: `color-mix(in srgb, ${meta.color} 25%, transparent)`,
      }}
    >
      <span
        className="size-1.5 rounded-full"
        style={{ backgroundColor: meta.color }}
      />
      {meta.label}
    </span>
  );
}
