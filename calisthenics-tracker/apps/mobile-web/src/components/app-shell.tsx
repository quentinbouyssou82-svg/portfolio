import type { ReactNode } from "react";
import { AppContainer } from "@cali/ui";

export function AppShell({ children }: { children: ReactNode }) {
  return <AppContainer>{children}</AppContainer>;
}
