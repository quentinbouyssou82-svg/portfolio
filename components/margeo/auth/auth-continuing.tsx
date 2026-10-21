"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/margeo/logo";
import { Button } from "@/components/margeo/ui/button";
import { Spinner } from "@/components/margeo/ui/spinner";
import {
  probeAuthBootstrapAction,
  type AuthBootstrapResult,
} from "@/lib/margeo/auth/bootstrap";
import { resolveSafePostAuthNext } from "@/lib/margeo/auth/safe-next";
import { DRIVEELY_PATHS } from "@/lib/margeo/constants";
import { createMargeoBrowserClient } from "@/lib/margeo/supabase/client";
import { cn } from "@/lib/margeo/utils";

const MAX_PROBES = 10;
const PROBE_GAP_MS = 350;

type Phase = "waiting" | "failed";

/**
 * Post-auth gate: wait for session+profile with automatic retries.
 * Never shows Retry for the first transient failures — only after
 * several automatic attempts, and only as a return-to-login escape.
 */
export function AuthContinuing({
  next,
  className,
}: {
  next: string;
  className?: string;
}) {
  const safeNext = resolveSafePostAuthNext(next);
  const [phase, setPhase] = useState<Phase>("waiting");
  const [detail, setDetail] = useState("Connexion en cours…");
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    let cancelled = false;
    let lastStatus: AuthBootstrapResult["status"] | null = null;

    async function run() {
      // Give the browser a tick to apply Set-Cookie from the server action.
      await new Promise((r) => setTimeout(r, 50));

      for (let i = 0; i < MAX_PROBES; i++) {
        if (cancelled) return;

        // Client cookie session first (cheap); then server profile probe.
        try {
          const supabase = createMargeoBrowserClient();
          const { data } = await supabase.auth.getUser();
          if (!data.user && i < 2) {
            // Session cookie may still be settling — keep waiting silently.
            setDetail("Connexion en cours…");
            await new Promise((r) => setTimeout(r, PROBE_GAP_MS));
            continue;
          }
        } catch {
          // Ignore client probe errors; server probe is authoritative.
        }

        let result: AuthBootstrapResult;
        try {
          result = await probeAuthBootstrapAction(safeNext);
        } catch {
          result = { status: "pending" };
        }

        if (cancelled) return;
        lastStatus = result.status;

        if (result.status === "ready") {
          setDetail("Redirection…");
          window.location.assign(result.redirectTo || safeNext);
          return;
        }

        setDetail(
          i < 4 ? "Connexion en cours…" : "Finalisation de ta session…",
        );

        await new Promise((r) => setTimeout(r, PROBE_GAP_MS * (1 + Math.min(i, 3) * 0.25)));
      }

      if (!cancelled) {
        // Truly no session after all retries → back to login (no Resume loop).
        if (lastStatus === "unauthenticated") {
          window.location.assign(DRIVEELY_PATHS.login);
          return;
        }
        setPhase("failed");
        setDetail(
          "La session met trop de temps à se stabiliser. Reconnecte-toi.",
        );
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [safeNext]);

  return (
    <div
      className={cn(
        "auth-continuing mx-auto flex w-full max-w-[420px] flex-col items-center text-center",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-busy={phase === "waiting"}
    >
      <div className="auth-continuing-logo app-fade-in">
        <Logo size="lg" />
      </div>

      {phase === "waiting" ? (
        <>
          <div className="auth-continuing-pulse mt-10" aria-hidden>
            <Spinner size="lg" label="Connexion en cours" />
          </div>
          <p className="auth-continuing-title mt-6 text-lg font-semibold tracking-tight text-mg-foreground">
            {detail}
          </p>
          <p className="mt-2 max-w-xs text-sm text-mg-muted">
            Préparation de ton espace Driveely…
          </p>
        </>
      ) : (
        <>
          <p className="mt-10 text-lg font-semibold tracking-tight text-mg-foreground">
            Connexion interrompue
          </p>
          <p className="mt-2 max-w-sm text-sm text-mg-muted">{detail}</p>
          <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              type="button"
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => {
                window.location.assign(DRIVEELY_PATHS.login);
              }}
            >
              Retour à la connexion
            </Button>
            <Link
              href={DRIVEELY_PATHS.home}
              className="inline-flex h-12 min-h-12 w-full items-center justify-center rounded-xl border border-mg-border bg-[var(--mg-surface-muted)] px-5 text-[0.9375rem] font-medium text-mg-foreground transition-colors hover:bg-[var(--mg-nav-hover)] sm:w-auto"
            >
              Accueil
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
