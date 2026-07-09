"use client";

import { MapPin } from "lucide-react";
import { Button } from "@/components/margeo/ui/button";
import { Card } from "@/components/margeo/ui/card";
import type { GeoPermission } from "@/hooks/margeo/use-geolocation";

interface LocationBannerProps {
  permission: GeoPermission;
  loading: boolean;
  error: string | null;
  onRequest: () => void;
}

export function LocationBanner({
  permission,
  loading,
  error,
  onRequest,
}: LocationBannerProps) {
  if (permission === "granted") return null;

  return (
    <Card className="mb-6 border-mg-accent/20 bg-mg-accent-soft/20 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-mg-accent-soft">
            <MapPin className="size-4 text-mg-accent" />
          </span>
          <div>
            <p className="text-sm font-medium text-mg-foreground">
              Autoriser Uberly à utiliser votre position
            </p>
            <p className="mt-0.5 text-xs text-mg-muted">
              Pour calculer la distance jusqu&apos;au restaurant et affiner le
              score de rentabilité.
            </p>
            {error && (
              <p className="mt-1 text-xs text-mg-stop">{error}</p>
            )}
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={onRequest}
          disabled={loading}
          className="shrink-0"
        >
          {loading ? "Localisation…" : "Autoriser"}
        </Button>
      </div>
    </Card>
  );
}
