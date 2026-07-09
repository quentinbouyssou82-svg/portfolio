import { useEffect, useRef } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { logNavigation, logRouteState } from "@/lib/navigation-log";
import { Screen } from "@cali/ui";

const LOCK_PATH = "/lock";
const HOME_PATH = "/";

function AuthSpinner() {
  return (
    <Screen className="items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-cali-accent border-t-transparent" />
    </Screen>
  );
}

/** Redirige une seule fois quand l'état auth est stable. */
function useAuthRedirect(mode: "guest" | "protected") {
  const { session, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const lastTarget = useRef<string | null>(null);

  useEffect(() => {
    logRouteState(mode === "guest" ? "GuestRoute" : "ProtectedRoute", {
      pathname: location.pathname,
      isLoading,
      hasSession: Boolean(session),
    });

    if (isLoading) return;

    const hasSession = Boolean(session);

    if (mode === "protected" && !hasSession && location.pathname !== LOCK_PATH) {
      if (lastTarget.current === LOCK_PATH) return;
      lastTarget.current = LOCK_PATH;
      logNavigation(location.pathname, LOCK_PATH, "protected: session absente");
      navigate(LOCK_PATH, { replace: true, state: { from: location } });
      return;
    }

    if (mode === "guest" && hasSession && location.pathname === LOCK_PATH) {
      if (lastTarget.current === HOME_PATH) return;
      lastTarget.current = HOME_PATH;
      logNavigation(location.pathname, HOME_PATH, "guest: session active");
      navigate(HOME_PATH, { replace: true });
      return;
    }

    lastTarget.current = null;
  }, [isLoading, session, location.pathname, navigate, mode, location]);

  return { session, isLoading };
}

export function ProtectedRoute() {
  const { session, isLoading } = useAuthRedirect("protected");
  const location = useLocation();

  if (isLoading) return <AuthSpinner />;

  if (!session) {
    if (location.pathname === LOCK_PATH) return null;
    return <AuthSpinner />;
  }

  return <Outlet />;
}

export function GuestRoute() {
  const { session, isLoading } = useAuthRedirect("guest");
  const location = useLocation();

  if (isLoading) return <AuthSpinner />;

  if (session && location.pathname === LOCK_PATH) {
    return <AuthSpinner />;
  }

  return <Outlet />;
}

/** Catch-all : redirige vers /lock ou / sans passer par un ping-pong. */
export function FallbackRedirect() {
  const { session, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const lastTarget = useRef<string | null>(null);

  useEffect(() => {
    logRouteState("FallbackRedirect", {
      pathname: location.pathname,
      isLoading,
      hasSession: Boolean(session),
      action: "catch-all",
    });

    if (isLoading) return;

    const target = session ? HOME_PATH : LOCK_PATH;
    if (location.pathname === target) return;
    if (lastTarget.current === target) return;

    lastTarget.current = target;
    logNavigation(location.pathname, target, "catch-all: route inconnue");
    navigate(target, { replace: true });
  }, [isLoading, session, location.pathname, navigate]);

  return <AuthSpinner />;
}
