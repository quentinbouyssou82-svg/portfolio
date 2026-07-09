import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ApexStoryHeadlineProps = {
  children?: ReactNode;
  className?: string;
  /** Line-by-line reveal (default). */
  lines?: ReactNode[];
  /** Word-by-word reveal — pass plain string. */
  words?: string;
  as?: "h1" | "h2" | "h3";
};

export function ApexStoryHeadline({
  children,
  className,
  lines,
  words,
  as: Tag = "h2",
}: ApexStoryHeadlineProps) {
  if (words) {
    const tokens = words.split(/(\s+)/);
    return (
      <Tag className={cn(className)} data-ax-headline-words>
        {tokens.map((token, i) =>
          token.trim() ? (
            <span key={`${token}-${i}`} data-ax-word data-ax-gold-scroll className="inline-block">
              {token}
            </span>
          ) : (
            <span key={`space-${i}`} className="inline-block whitespace-pre">
              {token}
            </span>
          ),
        )}
      </Tag>
    );
  }

  if (lines?.length) {
    return (
      <Tag className={cn(className)} data-ax-headline>
        {lines.map((line, i) => (
          <span
            key={i}
            data-ax-line
            {...(typeof line === "string" ? { "data-ax-gold-scroll": true } : {})}
            className="block"
          >
            {line}
          </span>
        ))}
      </Tag>
    );
  }

  return (
    <Tag className={cn(className)} data-ax-headline data-ax-gold-scroll>
      {children}
    </Tag>
  );
}
