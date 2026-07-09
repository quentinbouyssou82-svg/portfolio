"use client";

import { useApexLocale } from "./apex-locale-provider";

export function ApexLangSwitcher() {
  const { locale, setLocale, t } = useApexLocale();
  const isEn = locale === "en";

  return (
    <div
      className="ax-lang-switch"
      role="group"
      aria-label={t.nav.langAria}
    >
      <span
        className="ax-lang-indicator"
        data-locale={locale}
        aria-hidden
      />
      <button
        type="button"
        className={`ax-lang-opt${!isEn ? " is-active" : ""}`}
        aria-pressed={!isEn}
        aria-label="Français"
        onClick={() => setLocale("fr")}
      >
        <span aria-hidden>🇫🇷</span>
      </button>
      <button
        type="button"
        className={`ax-lang-opt${isEn ? " is-active" : ""}`}
        aria-pressed={isEn}
        aria-label="English"
        onClick={() => setLocale("en")}
      >
        <span aria-hidden>🇬🇧</span>
      </button>
    </div>
  );
}
