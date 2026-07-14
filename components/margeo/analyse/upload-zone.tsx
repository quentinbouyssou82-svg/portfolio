"use client";

import { ImageIcon, Sparkles, Upload } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { CaptureGuide } from "@/components/margeo/analyse/capture-guide";
import { Button } from "@/components/margeo/ui/button";
import { cn } from "@/lib/margeo/utils";

interface UploadZoneProps {
  onUpload: (previewUrl: string | null, file?: File) => void;
}

export function UploadZone({ onUpload }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
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

  return (
    <div className="app-fade-in">
      <div
        role="button"
        tabIndex={0}
        aria-label="Déposer une capture d'écran"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
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
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          capture="environment"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        <div className="app-upload-icon">
          <Upload className="size-6" strokeWidth={1.75} />
        </div>

        <p className="mt-4 text-base font-semibold text-mg-foreground">
          {dragging ? "Lâche ici" : "Dépose ta capture"}
        </p>
        <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-mg-muted">
          Appuie pour choisir depuis ta galerie.
        </p>

        <div className="mt-5 flex items-center gap-2 text-xs text-mg-faint">
          <ImageIcon className="size-3.5" />
          Uber Eats · Deliveroo · Stuart · Amazon Flex
        </div>
      </div>

      <CaptureGuide />

      <div className="mt-4 flex justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const canvas = document.createElement("canvas");
            canvas.width = 1;
            canvas.height = 1;
            canvas.toBlob((blob) => {
              if (!blob) return;
              const file = new File([blob], "exemple.png", {
                type: "image/png",
              });
              onUpload(URL.createObjectURL(file), file);
            }, "image/png");
          }}
        >
          <Sparkles />
          Pas de capture ? Essayer l&apos;exemple
        </Button>
      </div>
    </div>
  );
}
