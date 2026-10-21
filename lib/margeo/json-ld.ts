import {
  PRODUCT_DESCRIPTION,
  PRODUCT_NAME,
  PRODUCT_TAGLINE,
  DRIVEELY_CONTACT_EMAIL,
} from "@/lib/margeo/brand";
import { DRIVEELY_FAQ_ITEMS } from "@/lib/margeo/landing-faq";
import {
  DRIVEELY_OG_IMAGE_PATH,
  driveelyAbsoluteUrl,
  getDriveelySiteOrigin,
} from "@/lib/margeo/seo";

export function driveelyOrganizationJsonLd() {
  const origin = getDriveelySiteOrigin();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: PRODUCT_NAME,
    url: origin,
    logo: `${origin}/driveely/icon-512.png`,
    email: DRIVEELY_CONTACT_EMAIL,
    description: PRODUCT_DESCRIPTION,
    sameAs: [] as string[],
  };
}

export function driveelyWebSiteJsonLd() {
  const origin = getDriveelySiteOrigin();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: PRODUCT_NAME,
    url: origin,
    description: PRODUCT_DESCRIPTION,
    inLanguage: "fr-FR",
    publisher: {
      "@type": "Organization",
      name: PRODUCT_NAME,
      url: origin,
    },
  };
}

export function driveelySoftwareApplicationJsonLd() {
  const origin = getDriveelySiteOrigin();
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: PRODUCT_NAME,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: origin,
    description: PRODUCT_DESCRIPTION,
    headline: PRODUCT_TAGLINE,
    image: `${origin}${DRIVEELY_OG_IMAGE_PATH}`,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EUR",
      description: "2 analyses gratuites par jour — Premium optionnel",
      url: driveelyAbsoluteUrl("/"),
    },
    featureList: [
      "Estimation du gain net après vos coûts",
      "Score et verdict accepter / vérifier / refuser",
      "Objectif du jour et historique",
      "Back Tap et Centre de contrôle",
    ],
  };
}

export function driveelyFaqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: DRIVEELY_FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function driveelyLandingJsonLdGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      driveelyOrganizationJsonLd(),
      driveelyWebSiteJsonLd(),
      driveelySoftwareApplicationJsonLd(),
      {
        "@type": "FAQPage",
        mainEntity: DRIVEELY_FAQ_ITEMS.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };
}
