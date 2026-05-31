import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <article
      className={cn(
        "rounded-3xl border border-[var(--border)] bg-[var(--surface)] backdrop-blur-xl shadow-[0_30px_70px_-45px_rgba(2,8,23,0.9)] transition-all duration-300",
        className,
      )}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6", className)} {...props} />;
}
