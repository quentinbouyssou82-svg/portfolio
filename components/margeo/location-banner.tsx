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
    <Card className="location-banner mb-5 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <span className="location-banner-icon" aria-hidden>
            <MapPin className="size-4" />
          </span>
          <div>
            <p className="text-sm font-medium text-mg-foreground">
              Active ta position
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-mg-muted">
              Pour affiner la distance et le score de rentabilité.
            </p>
            {error && (
              <p className="mt-1 text-xs text-mg-stop">{error}</p>
            )}
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={onRequest}
          disabled={loading}
          loading={loading}
          className="shrink-0"
        >
          Activer
        </Button>
      </div>
    </Card>
  );
}
