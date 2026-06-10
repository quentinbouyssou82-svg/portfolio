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
      aria-label="Information cookies"
      className="fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-2xl border border-[var(--palan-line)] bg-[var(--palan-ivory)] p-5 shadow-lg md:inset-x-6 md:p-6"
    >
      <p className="text-[0.8rem] leading-relaxed text-[var(--palan-gray)]">
        Ce site utilise des cookies strictement nécessaires au fonctionnement et, avec votre accord,
        des mesures d&apos;audience anonymisées. En continuant, vous acceptez notre utilisation des
        cookies.{" "}
        <Link
          href={`${PALAN_BASE}/mentions-legales#confidentialite`}
          className="text-[var(--palan-gold)] underline underline-offset-2"
        >
          En savoir plus
        </Link>
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={accept}
          className="bg-[var(--palan-gold)] px-5 py-2.5 text-[0.65rem] font-medium uppercase tracking-[0.12em] text-white transition-opacity hover:opacity-85"
        >
          Accepter
        </button>
        <Link
          href={`${PALAN_BASE}/mentions-legales#confidentialite`}
          className="border border-[var(--palan-line)] px-5 py-2.5 text-[0.65rem] uppercase tracking-[0.12em] text-[var(--palan-navy)] transition-colors hover:border-[var(--palan-gold)]"
        >
          Paramètres
        </Link>
      </div>
    </div>
  );
}
