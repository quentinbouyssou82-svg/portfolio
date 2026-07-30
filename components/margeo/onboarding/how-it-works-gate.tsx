"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  buildHowItWorksPath,
  hasSeenHowItWorksClient,
} from "@/lib/margeo/how-it-works";
import { DRIVEELY_PATHS } from "@/lib/margeo/constants";

/**
 * Redirige une fois vers le tour produit si l'utilisateur ne l'a pas encore vu.
 * Backup du redirect post-auth — skip toujours possible sur le tour.
 */
export function HowItWorksGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (hasSeenHowItWorksClient()) {
      setReady(true);
      return;
    }
    // Backup post-auth : envoyer vers le tour puis revenir ici.
    router.replace(buildHowItWorksPath(DRIVEELY_PATHS.onboarding));
  }, [router]);

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
