import { Brain } from "lucide-react";
import { cn } from "../../_lib/cn";

const sizeMap = {
  sm: { box: "size-8 rounded-[10px]", icon: "size-4" },
  md: { box: "size-11 rounded-[14px]", icon: "size-6" },
  lg: { box: "size-14 rounded-2xl", icon: "size-7" },
} as const;

export function BrandIcon({
  size = "md",
  className,
}: {
  size?: keyof typeof sizeMap;
  className?: string;
}) {
  const s = sizeMap[size];
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center border border-[var(--cn-primary-border)] bg-[var(--cn-primary-tint)] text-[var(--cn-primary)]",
        s.box,
        className,
      )}
    >
      <Brain className={s.icon} />
    </span>
  );
}
