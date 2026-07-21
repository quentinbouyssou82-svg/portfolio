"use client";

import { Camera, ImageIcon, Upload } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { CaptureGuide } from "@/components/margeo/analyse/capture-guide";
import { PlatformLogo } from "@/components/margeo/platform-logo";
import { Button } from "@/components/margeo/ui/button";
import { cn } from "@/lib/margeo/utils";

const UPLOAD_PLATFORMS = [
  "Uber Eats",
  "Deliveroo",
  "Stuart",
  "Amazon Flex",
] as const;

interface UploadZoneProps {
  onUpload: (previewUrl: string | null, file?: File) => void;
}

export function UploadZone({ onUpload }: UploadZoneProps) {
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        toast.error("Format non supporté", {
          description: "PNG, JPG ou WebP.",
        });
        return;
      }
      onUpload(URL.createObjectURL(file), file);
    },
    [onUpload],
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0]);
    e.target.value = "";
  };

  return (
    <div className="app-fade-in">
      {/* Sans `capture` : iOS/Android proposent Photo / Galerie / Fichiers */}
      <input
        ref={galleryRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/*"
        className="sr-only"
        onChange={onInputChange}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={onInputChange}
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,.png,.jpg,.jpeg,.webp"
        className="sr-only"
        onChange={onInputChange}
      />

      <div
        role="button"
        tabIndex={0}
        aria-label="Importer une capture d'écran"
        onClick={() => galleryRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && galleryRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files[0]);
        }}
        className={cn(
          "app-upload-zone",
          dragging && "app-upload-zone-active",
        )}
      >
        <div className="app-upload-icon">
          <Upload className="size-6" strokeWidth={1.75} />
        </div>

        <p className="mt-4 text-base font-semibold text-mg-foreground">
          {dragging ? "Lâche ici" : "Importer une capture"}
        </p>
        <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-mg-muted">
          Galerie, appareil photo ou fichier — à toi de choisir.
        </p>
        <p className="mt-2 max-w-sm text-center text-[11px] leading-relaxed text-mg-faint">
          L&apos;IA peut se tromper — vérifie toujours le gain et la distance.
          Résultats indicatifs.
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {UPLOAD_PLATFORMS.map((platform) => (
            <PlatformLogo key={platform} platform={platform} size="xs" showLabel />
          ))}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="min-h-11 flex-col gap-1 py-2 text-[11px] sm:flex-row sm:text-xs"
          onClick={(e) => {
            e.stopPropagation();
            cameraRef.current?.click();
          }}
        >
          <Camera className="size-4" />
          Photo
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="min-h-11 flex-col gap-1 py-2 text-[11px] sm:flex-row sm:text-xs"
          onClick={(e) => {
            e.stopPropagation();
            galleryRef.current?.click();
          }}
        >
          <ImageIcon className="size-4" />
          Galerie
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="min-h-11 flex-col gap-1 py-2 text-[11px] sm:flex-row sm:text-xs"
          onClick={(e) => {
            e.stopPropagation();
            fileRef.current?.click();
          }}
        >
          <Upload className="size-4" />
          Fichier
        </Button>
      </div>

      <CaptureGuide />
    </div>
  );
}
