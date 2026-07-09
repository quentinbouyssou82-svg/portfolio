export const clientBrief = {
  analytics: {
    enabled: Boolean(process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN),
    domain: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ?? "",
  },
  contact: {
    recipientEmail: process.env.PALAN_CONTACT_EMAIL ?? "julien@sas-living.com",
    autoReply: true,
  },
  launchDate: "2026-06-19",
} as const;
