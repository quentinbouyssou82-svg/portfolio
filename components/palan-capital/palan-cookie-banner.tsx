"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PALAN_BASE } from "@/lib/palan-capital/constants";

const STORAGE_KEY = "palan-capital-cookies-accepted";

export function PalanCookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  function accept() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookies"
      className="fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-lg border border-[var(--line-gold)] bg-[var(--white)] p-6 shadow-[0_8px_40px_rgba(11,20,38,0.1)]"
    >
      <p className="text-[0.8125rem] leading-relaxed text-[var(--gray)]">
        Ce site utilise des cookies nécessaires à son fonctionnement.{" "}
        <Link href={`${PALAN_BASE}/mentions-legales#confidentialite`} className="text-[var(--gold)] underline">
          En savoir plus
        </Link>
      </p>
      <button type="button" onClick={accept} className="pc-btn pc-btn-gold mt-5">
        Accepter
      </button>
    </div>
  );
}
