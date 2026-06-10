"use client";

import { useEffect } from "react";

type CtModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

export function CtModal({ open, title, onClose, children }: CtModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="ct-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="ct-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ct-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ct-modal-header">
          <h3 id="ct-modal-title" className="ct-modal-title">
            {title}
          </h3>
          <button
            type="button"
            className="ct-btn ct-btn-ghost ct-btn-icon"
            onClick={onClose}
            aria-label="Fermer"
          >
            ×
          </button>
        </div>
        <div className="ct-modal-body">{children}</div>
      </div>
    </div>
  );
}
