"use client";

import { useEffect, useState } from "react";
import {
  buildHowItWorksPath,
  hasHowItWorksCookieClient,
} from "@/lib/margeo/how-it-works";
import { DRIVEELY_PATHS } from "@/lib/margeo/constants";

/**
 * Backup client gate (server middleware + onboarding page also enforce).
 * Cookie-only — never promote localStorage to “seen” here.
 */
export function HowItWorksGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (hasHowItWorksCookieClient()) {
      setReady(true);
      return;
    }
    window.location.replace(buildHowItWorksPath(DRIVEELY_PATHS.onboarding));
  }, []);

  if (!ready) {
    return (
      <div
        className="flex min-h-dvh items-center justify-center bg-mg-background"
        aria-busy="true"
        aria-label="Chargement"
      >
        <span className="size-8 animate-spin rounded-full border-2 border-mg-accent/25 border-t-mg-accent" />
      </div>
    );
  }

  return <>{children}</>;
}
