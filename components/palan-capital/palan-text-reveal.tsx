import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PalanHeadlineReveal({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn("ax-headline-reveal", className)}>{children}</div>;
}
