import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./cn.js";

export interface ScreenProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Screen({ children, className, ...props }: ScreenProps) {
  return (
    <div
      className={cn("flex min-h-0 flex-1 flex-col", className)}
      {...props}
    >
      {children}
    </div>
  );
}
