import Link from "next/link";
import { cn } from "../../_lib/cn";

export function NeonButtonLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={cn("cn-neon-btn-wrap group", className)}>
      <span className="cn-neon-btn">
        <span className="cn-neon-btn-ring" aria-hidden />
        <span className="cn-neon-btn-inner">{children}</span>
      </span>
    </Link>
  );
}
