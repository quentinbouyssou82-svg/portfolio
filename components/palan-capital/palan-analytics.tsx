import Script from "next/script";
import { clientBrief } from "@/lib/palan-capital/brief";

export function PalanAnalytics() {
  const domain = clientBrief.analytics.domain;
  if (!domain) return null;

  return (
    <Script
      defer
      data-domain={domain}
      src="https://plausible.io/js/script.js"
      strategy="afterInteractive"
    />
  );
}
