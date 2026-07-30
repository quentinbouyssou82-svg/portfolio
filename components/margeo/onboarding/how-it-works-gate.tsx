"use client";

import { useEffect, useState } from "react";
import {
  buildHowItWorksPath,
  hasSeenHowItWorksClient,
  markHowItWorksSeenClient,
} from "@/lib/margeo/how-it-works";
import { DRIVEELY_PATHS } from "@/lib/margeo/constants";

/**
 * Backup client gate (server middleware + onboarding page also enforce).
 * Uses hard navigation — soft router.replace raced with post-auth cookies.
 */
export function HowItWorksGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (hasSeenHowItWorksClient()) {
      markHowItWorksSeenClient();
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
