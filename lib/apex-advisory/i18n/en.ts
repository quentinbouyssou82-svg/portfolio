import type { ApexMessages } from "./types";

export const en: ApexMessages = {
  meta: {
    title: "Palan Capital — Financial engineering & wealth structuring",
    description:
      "Independent financial engineering firm. Asset financing & leasing, private debt, security trusts, wealth structuring, capital raising. France · Luxembourg · United Arab Emirates.",
  },
  nav: {
    links: [
      { label: "Expertise", id: "services" },
      { label: "Approach", id: "approach" },
      { label: "Audiences", id: "credibility" },
      { label: "Contact", id: "contact" },
    ],
    cta: "Consultation",
    homeAria: "Palan Capital — home",
    langAria: "Choose language",
  },
  hero: {
    eyebrow: "Independent financial engineering firm",
    title: [
      {
        parts: [
          { text: "Create " },
          { text: "leverage.", highlight: true },
        ],
      },
      {
        parts: [
          { text: "Reveal " },
          { text: "value.", highlight: true },
        ],
      },
    ],
    subtitle: [
      "Asset financing · leasing · private debt",
      "Security trusts · wealth structuring · capital raising",
      "France · Luxembourg · United Arab Emirates",
    ],
    ctas: {
      primary: "Request a consultation",
      secondary: "Our expertise",
    },
    scrollAria: "Scroll to expertise",
    marquee: [
      "France",
      "Luxembourg",
      "United Arab Emirates",
      "Private debt",
      "Wealth structuring",
      "Capital raising",
      "Executives",
      "Private wealth",
      "Funds",
      "Qualified investors",
    ],
  },
  heroPanel: {
    glance: "At a glance",
    items: [
      {
        flag: "france",
        value: "France",
        label: "Primary jurisdiction — Brokerage · IOBSP · CIF",
      },
      {
        flag: "luxembourg",
        value: "Luxembourg",
        label: "Investment vehicles",
      },
      {
        flag: "uae",
        value: "UAE",
        label: "International structuring",
      },
      {
        flag: "poles",
        value: "pillars",
        label: "Integrated expertise",
        countUp: 4,
      },
    ],
    foot: "Independent firm — structure before financing. France · Luxembourg · UAE.",
  },
  expertises: {
    tag: "Our expertise",
    title: ["Four pillars,", "one disciplined capital."],
    intro:
      "We operate at every layer of the financial structure — from idle treasury to tangible assets, from private debt to capital raising. An integrated, bespoke approach.",
    items: [
      {
        num: "01",
        title: "Financing & leasing",
        en: "Debt Solutions",
        desc: "Refinancing of tangible assets and long-term leasing solutions. Your assets mobilised, your liquidity preserved.",
        tags: ["Commercial property", "Vehicles", "Yachts & jets", "Leasing · LOA"],
      },
      {
        num: "02",
        title: "Private debt",
        en: "Private Yield",
        desc: "Access to selected private debt products. Turn treasury into margin leverage without disrupting operations.",
        tags: ["Structured notes", "Mezzanine debt", "Controlled maturities", "Negotiated collateral"],
      },
      {
        num: "03",
        title: "Wealth structuring",
        en: "Wealth Engineering",
        desc: "Multi-jurisdictional legal architecture. Holdings, security trusts, equity refinancing, succession planning.",
        tags: ["Security trusts", "Family holdings", "Succession", "Cross-border"],
      },
      {
        num: "04",
        title: "Capital raising",
        en: "Capital Raising",
        desc: "Equity and debt capital raising support. Vehicle design, investment memos, qualified investor sourcing.",
        tags: ["Equity", "Debt", "IC memos", "Co-investments"],
      },
    ],
  },
  convictions: {
    tag: "Our approach",
    title: ["Three convictions guide", "every mandate we take on."],
    intro:
      "Every transaction we lead follows the same logic: identify where value is truly created, structure the instruments that capture it, and align interests over the long term.",
    items: [
      {
        num: "01",
        name: "Structure before financing",
        text: "A well-structured financing always beats an abundant one. We design the legal and contractual architecture first — collateral instruments, intermediary vehicles, intra-group flows — before settling on the amount. That is what separates a deal that holds from one that unravels at the first sign of stress.",
        keywords: ["Structure", "financing"],
      },
      {
        num: "02",
        name: "Reveal underlying value",
        text: "Most companies and estates carry underused assets: operating real estate, minority stakes, intra-group receivables, intangible rights. Our work is to identify these reserves of value and design the instruments — security trusts, sale-and-leaseback, refinancing — that unlock them without alienating the asset.",
        keywords: ["Reveal", "value"],
      },
      {
        num: "03",
        name: "Align interests over time",
        text: "Financial engineering is judged over ten years, not at closing. Our structures account for foreseeable events — disposal, succession, a new partner — from the outset. A vehicle that cannot evolve with its ownership becomes a future constraint. We build structures that accompany, not confine.",
        keywords: ["Align", "time"],
      },
    ],
  },
  audiences: {
    tag: "Who we serve",
    title: ["For every audience,", "its own language."],
    quote: "Every mandate begins with a scoping consultation. Confidential, with no obligation.",
    items: [
      {
        num: "01 · For executives & sellers",
        title: "Executive advisory",
        text: "Financial leverage, unlocking dormant assets, preparing for disposal or succession. Refinancing and security trusts to release value without alienating the asset.",
      },
      {
        num: "02 · For private wealth",
        title: "Private wealth",
        text: "International structuring, family holdings, optimising idle liquidity, succession. For families and executives with complex, multi-jurisdictional estates.",
      },
      {
        num: "03 · For investment funds",
        title: "Fund advisory",
        text: "Pre-exit optimisation of holdings, equity investment preparation, structuring complex deals — security trusts, mezzanine debt, earn-outs, co-investments.",
      },
      {
        num: "04 · For qualified investors",
        title: "Investors",
        text: "Proprietary opportunities in private debt, structured notes, equity co-investments. Exposure to vehicles we have designed or selected ourselves.",
      },
    ],
  },
  contact: {
    tag: "Contact",
    title: ["A question,", "a mandate,", "an opportunity."],
    intro:
      "Every mandate begins with a scoping consultation. We assess feasibility and relevance before any formal proposal. Confidential meetings, with no obligation.",
    button: "Request a consultation",
  },
  footer: {
    description:
      "Independent financial engineering and wealth structuring firm. France · Luxembourg · United Arab Emirates.",
    legal: "SAS LIVING · SIREN 983 940 958 · RCS Toulouse\nORIAS IOBSP 2021 · CIF pending",
  },
  sectionCtas: {
    services: {
      inline: { label: "View our methodology", section: "approach" },
      end: [
        { label: "Discover our approach", section: "approach", variant: "primary" },
        { label: "Speak to an expert", section: "contact", variant: "ghost" },
      ],
    },
    approach: {
      inline: { label: "Explore our audiences", section: "credibility" },
      end: [
        { label: "See who we serve", section: "credibility", variant: "primary" },
        { label: "Request a consultation", section: "contact", variant: "ghost" },
      ],
    },
    credibility: {
      inline: { label: "Review our expertise", section: "services" },
      end: [
        { label: "Speak to an expert", section: "contact", variant: "primary" },
        { label: "Back to expertise", section: "services", variant: "ghost" },
      ],
    },
  },
};
