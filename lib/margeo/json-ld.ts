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
      description: "Bêta / plan Découverte — analyses limitées gratuites",
      url: driveelyAbsoluteUrl("/login?mode=signup&beta=1"),
    },
    featureList: [
      "Estimation du gain net avant acceptation",
      "Coûts au km et retour à vide",
      "Uber Eats, Deliveroo, Stuart, Amazon Flex",
      "Verdict en quelques secondes",
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
