import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./cn.js";

export interface AppContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function AppContainer({ children, className, ...props }: AppContainerProps) {
  return (
    <div className="min-h-dvh w-full bg-cali-bg">
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.12),transparent)]"
        aria-hidden
      />
      <div
        className={cn(
          "relative mx-auto flex min-h-dvh w-full max-w-[min(100%,var(--width-cali-app-max))] flex-col",
          "px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </div>
  );
}
