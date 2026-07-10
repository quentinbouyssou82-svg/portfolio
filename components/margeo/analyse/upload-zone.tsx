"use client";

import { motion } from "framer-motion";
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
          description: "Envoie une capture PNG, JPG ou WebP.",
        });
        return;
      }
      onUpload(URL.createObjectURL(file), file);
    },
    [onUpload],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
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
          "group flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-5 py-12 text-center transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-mg-accent/40 active:scale-[0.99] sm:px-6 sm:py-16",
          dragging
            ? "border-mg-accent bg-mg-accent-soft"
            : "border-mg-border-strong bg-mg-card [@media(hover:hover)]:hover:border-mg-accent/40 [@media(hover:hover)]:hover:bg-mg-card-hover",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        <div
          className={cn(
            "flex size-16 items-center justify-center rounded-2xl bg-mg-accent-soft transition-transform duration-300",
            dragging ? "scale-110" : "[@media(hover:hover)]:group-hover:scale-105",
          )}
        >
          <Upload className="size-7 text-mg-accent" />
        </div>

        <p className="mt-5 text-base font-semibold text-mg-foreground sm:text-lg">
          {dragging ? "Lâche ta capture ici" : "Dépose ta capture d'écran"}
        </p>
        <p className="mt-1.5 max-w-sm text-sm text-mg-muted">
          Appuie pour choisir une photo ou glisse l&apos;image ici.
        </p>

        <div className="mt-6 flex items-center gap-2 text-xs text-mg-faint">
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
          className="text-mg-muted min-h-11"
        >
          <Sparkles />
          Pas de capture ? Essayer avec un exemple
        </Button>
      </div>
    </motion.div>
  );
}
