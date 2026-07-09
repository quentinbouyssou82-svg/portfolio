"use client";

import { useCallback, useEffect, useState } from "react";

export type GeoPermission = "granted" | "denied" | "unknown";

export interface GeoPosition {
  lat: number;
  lng: number;
  accuracy?: number;
}

export function useGeolocation() {
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [permission, setPermission] = useState<GeoPermission>("unknown");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const syncToServer = useCallback(async (pos: GeoPosition, perm: GeoPermission) => {
    try {
      await fetch("/api/uberly/location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: pos.lat,
          lng: pos.lng,
          accuracy: pos.accuracy,
          permission: perm,
        }),
      });
    } catch {
      // silencieux — pas bloquant
    }
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Géolocalisation non supportée par ce navigateur.");
      setPermission("denied");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (geo) => {
        const pos: GeoPosition = {
          lat: geo.coords.latitude,
          lng: geo.coords.longitude,
          accuracy: geo.coords.accuracy,
        };
        setPosition(pos);
        setPermission("granted");
        setLoading(false);
        void syncToServer(pos, "granted");
      },
      (err) => {
        setLoading(false);
        setPermission("denied");
        setError(
          err.code === 1
            ? "Permission refusée. Uberly ne peut pas optimiser les scores sans position."
            : "Impossible d'obtenir ta position.",
        );
        void syncToServer({ lat: 0, lng: 0 }, "denied");
      },
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 },
    );
  }, [syncToServer]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.permissions) return;
    void navigator.permissions
      .query({ name: "geolocation" })
      .then((status) => {
        if (status.state === "granted") requestLocation();
        else if (status.state === "denied") setPermission("denied");
      })
      .catch(() => {});
  }, [requestLocation]);

  return { position, permission, loading, error, requestLocation };
}
