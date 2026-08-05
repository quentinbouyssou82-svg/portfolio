"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/margeo/logo";
import { Button } from "@/components/margeo/ui/button";
import { Spinner } from "@/components/margeo/ui/spinner";
import { resolveSafePostAuthNext } from "@/lib/margeo/auth/safe-next";
import { DRIVEELY_PATHS } from "@/lib/margeo/constants";
import { createMargeoBrowserClient } from "@/lib/margeo/supabase/client";
import { cn } from "@/lib/margeo/utils";

const MAX_PROBES = 12;
const PROBE_GAP_MS = 280;

type Phase = "waiting" | "failed";

type ReadyPayload =
  | { status: "ready"; redirectTo: string }
  | { status: "pending" }
  | { status: "unauthenticated" };

async function probeReady(next: string): Promise<ReadyPayload> {
  try {
    const res = await fetch(
      `/api/driveely/auth/ready?next=${encodeURIComponent(next)}`,
      { credentials: "same-origin", cache: "no-store" },
    );
    const data = (await res.json().catch(() => null)) as ReadyPayload | null;
    if (!data || typeof data !== "object" || !("status" in data)) {
      return { status: "pending" };
    }
    return data;
  } catch {
    return { status: "pending" };
  }
}

/**
 * Post-auth gate: wait for session+profile with automatic retries.
 * Uses cookie-based `/api/driveely/auth/ready` (not a Server Action) so the
 * jar set by sign-in is visible immediately. No Retry UI for transient races.
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
    let sawClientUser = false;

    async function run() {
      await new Promise((r) => setTimeout(r, 60));

      for (let i = 0; i < MAX_PROBES; i++) {
        if (cancelled) return;

        let clientUser = false;
        try {
          const supabase = createMargeoBrowserClient();
          const { data } = await supabase.auth.getUser();
          clientUser = Boolean(data.user);
          if (clientUser) sawClientUser = true;
        } catch {
          /* keep trying */
        }

        let result = await probeReady(safeNext);

        // Browser has session; API still 401 → cookie settle lag, keep waiting.
        if (result.status === "unauthenticated" && (clientUser || sawClientUser)) {
          result = { status: "pending" };
        }

        if (cancelled) return;

        if (result.status === "ready") {
          setDetail("Redirection…");
          window.location.assign(result.redirectTo || safeNext);
          return;
        }

        // Client session stable → navigate; shell waits for profile if needed.
        if (clientUser && i >= 2) {
          setDetail("Redirection…");
          window.location.assign(safeNext);
          return;
        }

        setDetail(
          i < 4 ? "Connexion en cours…" : "Finalisation de ta session…",
        );
        await new Promise((r) =>
          setTimeout(r, PROBE_GAP_MS * (1 + Math.min(i, 3) * 0.2)),
        );
      }

      if (!cancelled) {
        if (sawClientUser) {
          setDetail("Redirection…");
          window.location.assign(safeNext);
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
