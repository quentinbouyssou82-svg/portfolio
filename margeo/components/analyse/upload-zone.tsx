"use client";

import { motion } from "framer-motion";
import { ImageIcon, Sparkles, Upload } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  onUpload: (previewUrl: string | null) => void;
}

export function UploadZone({ onUpload }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        toast.error("Format non supporté", {
          description: "Dépose une capture d'écran (PNG, JPG ou WebP).",
        });
        return;
      }
      onUpload(URL.createObjectURL(file));
    },
    [onUpload]
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
          "group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-16 text-center transition-all duration-300",
          dragging
            ? "border-accent bg-accent-soft scale-[1.01]"
            : "border-border-strong bg-card hover:border-accent/40 hover:bg-card-hover"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        <div
          className={cn(
            "flex size-16 items-center justify-center rounded-2xl bg-accent-soft transition-transform duration-300",
            dragging ? "scale-110" : "group-hover:scale-105"
          )}
        >
          <Upload className="size-7 text-accent" />
        </div>

        <p className="mt-5 font-semibold text-foreground">
          {dragging
            ? "Lâche ta capture ici"
            : "Dépose ta capture d'écran"}
        </p>
        <p className="mt-1.5 max-w-sm text-sm text-muted">
          Glisse l&apos;image de la proposition de course, ou clique pour la
          sélectionner. PNG, JPG, WebP.
        </p>

        <div className="mt-6 flex items-center gap-2 text-xs text-faint">
          <ImageIcon className="size-3.5" />
          Uber Eats · Deliveroo · Shopopop · Stuart · Amazon Flex
        </div>
      </div>

      <div className="mt-4 flex justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onUpload(null)}
          className="text-muted"
        >
          <Sparkles />
          Pas de capture sous la main ? Essayer avec un exemple
        </Button>
      </div>
    </motion.div>
  );
}
