"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type GeoPermission = "granted" | "denied" | "unknown";

export interface GeoPosition {
  lat: number;
  lng: number;
  accuracy?: number;
}

export interface GeolocationInitial {
  lat?: number;
  lng?: number;
  permission?: GeoPermission;
}

function validCoord(n: number | undefined): n is number {
  return n != null && Number.isFinite(n) && n !== 0;
}

export function useGeolocation(initial?: GeolocationInitial) {
  const hydrated =
    validCoord(initial?.lat) && validCoord(initial?.lng)
      ? { lat: initial!.lat!, lng: initial!.lng! }
      : null;

  const [position, setPosition] = useState<GeoPosition | null>(hydrated);
  const [permission, setPermission] = useState<GeoPermission>(
    initial?.permission === "granted" && hydrated
      ? "granted"
      : (initial?.permission ?? "unknown"),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const syncedRef = useRef(false);

  const syncToServer = useCallback(
    async (pos: GeoPosition | null, perm: GeoPermission) => {
      try {
        const res = await fetch("/api/uberly/location", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lat: pos?.lat,
            lng: pos?.lng,
            accuracy: pos?.accuracy,
            permission: perm,
          }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          console.warn("[uberly/geo] sync failed:", data.error ?? res.status);
        }
      } catch (e) {
        console.warn("[uberly/geo] sync error:", e);
      }
    },
    [],
  );

  const applyPosition = useCallback(
    (pos: GeoPosition, perm: GeoPermission = "granted", sync = true) => {
      setPosition(pos);
      setPermission(perm);
      setError(null);
      if (sync && !syncedRef.current) {
        syncedRef.current = true;
        void syncToServer(pos, perm);
      }
    },
    [syncToServer],
  );

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Géolocalisation non supportée par ce navigateur.");
      setPermission("denied");
      void syncToServer(null, "denied");
      return;
    }

    setLoading(true);
    setError(null);
    syncedRef.current = false;

    navigator.geolocation.getCurrentPosition(
      (geo) => {
        const pos: GeoPosition = {
          lat: geo.coords.latitude,
          lng: geo.coords.longitude,
          accuracy: geo.coords.accuracy,
        };
        setLoading(false);
        applyPosition(pos, "granted", true);
      },
      (err) => {
        setLoading(false);
        setPermission("denied");
        setError(
          err.code === 1
            ? "Permission refusée. Uberly ne peut pas optimiser les scores sans position."
            : err.code === 3
              ? "Délai dépassé. Réessaie en extérieur ou vérifie le GPS."
              : "Impossible d'obtenir ta position.",
        );
        void syncToServer(null, "denied");
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 60_000 },
    );
  }, [applyPosition, syncToServer]);

  /** Rafraîchissement silencieux (iOS / session existante). */
  const refreshSilent = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (geo) => {
        applyPosition(
          {
            lat: geo.coords.latitude,
            lng: geo.coords.longitude,
            accuracy: geo.coords.accuracy,
          },
          "granted",
          true,
        );
      },
      () => {
        /* garder la position hydratée si échec */
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 },
    );
  }, [applyPosition]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;

    if (initial?.permission === "denied") {
      setPermission("denied");
      return;
    }

    if (hydrated && initial?.permission === "granted") {
      setPermission("granted");
      refreshSilent();
      return;
    }

    if (typeof navigator.permissions?.query === "function") {
      void navigator.permissions
        .query({ name: "geolocation" })
        .then((status) => {
          if (status.state === "granted") {
            requestLocation();
          } else if (status.state === "denied") {
            setPermission("denied");
          }
          status.onchange = () => {
            if (status.state === "granted") requestLocation();
            else if (status.state === "denied") setPermission("denied");
          };
        })
        .catch(() => {
          if (hydrated) refreshSilent();
        });
      return;
    }

    // iOS Safari : Permissions API absente — tenter une lecture cache
    if (hydrated) {
      setPermission("granted");
      refreshSilent();
    }
  }, [hydrated, initial?.permission, refreshSilent, requestLocation]);

  return { position, permission, loading, error, requestLocation };
}
