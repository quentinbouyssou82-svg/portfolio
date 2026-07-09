import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { AuthSession } from "@cali/types";
import { STORAGE_KEYS, isSessionExpired } from "@cali/utils/session";
import { apiFetch } from "./api";
import { logRouteState } from "./navigation-log";

interface AuthContextValue {
  session: AuthSession | null;
  isLoading: boolean;
  login: (pin: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loadStoredSession(): AuthSession | null {
  const token = localStorage.getItem(STORAGE_KEYS.authToken);
  const expiresAt = localStorage.getItem(STORAGE_KEYS.authExpiry);
  if (!token || !expiresAt || isSessionExpired(expiresAt)) {
    localStorage.removeItem(STORAGE_KEYS.authToken);
    localStorage.removeItem(STORAGE_KEYS.authExpiry);
    return null;
  }
  return { token, expiresAt };
}

function persistSession(session: AuthSession | null) {
  if (!session) {
    localStorage.removeItem(STORAGE_KEYS.authToken);
    localStorage.removeItem(STORAGE_KEYS.authExpiry);
    return;
  }
  localStorage.setItem(STORAGE_KEYS.authToken, session.token);
  localStorage.setItem(STORAGE_KEYS.authExpiry, session.expiresAt);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => loadStoredSession());
  const [isLoading, setIsLoading] = useState(() => {
    const stored = loadStoredSession();
    return Boolean(stored);
  });
  const bootstrapped = useRef(false);

  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    const stored = loadStoredSession();
    logRouteState("AuthProvider", {
      pathname: window.location.pathname,
      isLoading: true,
      hasSession: Boolean(stored),
      action: "bootstrap",
    });

    if (!stored) {
      setSession(null);
      setIsLoading(false);
      logRouteState("AuthProvider", {
        pathname: window.location.pathname,
        isLoading: false,
        hasSession: false,
        action: "no-stored-session",
      });
      return;
    }

    apiFetch<AuthSession>("/api/auth/session", {
      headers: { Authorization: `Bearer ${stored.token}` },
    })
      .then((valid) => {
        setSession(valid);
        persistSession(valid);
        logRouteState("AuthProvider", {
          pathname: window.location.pathname,
          isLoading: false,
          hasSession: true,
          action: "session-validated",
        });
      })
      .catch(() => {
        persistSession(null);
        setSession(null);
        logRouteState("AuthProvider", {
          pathname: window.location.pathname,
          isLoading: false,
          hasSession: false,
          action: "session-rejected",
        });
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (pin: string) => {
    const result = await apiFetch<AuthSession>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ pin }),
    });
    setSession(result);
    persistSession(result);
    logRouteState("AuthProvider", {
      pathname: window.location.pathname,
      isLoading: false,
      hasSession: true,
      action: "login-success",
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch {
      /* ignore */
    }
    persistSession(null);
    setSession(null);
    logRouteState("AuthProvider", {
      pathname: window.location.pathname,
      isLoading: false,
      hasSession: false,
      action: "logout",
    });
  }, []);

  const value = useMemo(
    () => ({ session, isLoading, login, logout }),
    [session, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
