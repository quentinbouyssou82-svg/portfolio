import { Badge } from "../ui/badge";

export function StepCard({
  badge,
  badgeEmoji,
  title,
  description,
  children,
}: {
  badge: string;
  badgeEmoji: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="cn-card p-6 sm:p-7">
      <Badge>
        <span>{badgeEmoji}</span>
        {badge}
      </Badge>
      <h2 className="mt-4 text-2xl font-bold tracking-tight">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-[var(--cn-muted)]">
        {description}
      </p>
      <div className="mt-6">{children}</div>
    </div>
  );
}
