export type ApexLocale = "fr" | "en";

export const APEX_LOCALES: ApexLocale[] = ["fr", "en"];
export const APEX_DEFAULT_LOCALE: ApexLocale = "fr";
export const APEX_LOCALE_STORAGE_KEY = "apex-locale";

export type ApexTitlePart = {
  text: string;
  highlight?: boolean;
};

export type ApexTitleLine = {
  parts: ApexTitlePart[];
};

export type ApexSectionCtaVariant = "primary" | "ghost" | "link";

export type ApexSectionCtaItem = {
  label: string;
  section: string;
  variant?: Exclude<ApexSectionCtaVariant, "link">;
};

export type ApexSectionCtas = {
  services: {
    inline: { label: string; section: string };
    end: ApexSectionCtaItem[];
  };
  approach: {
    inline: { label: string; section: string };
    end: ApexSectionCtaItem[];
  };
  credibility: {
    inline: { label: string; section: string };
    end: ApexSectionCtaItem[];
  };
};

export type ApexHeroPanelItem = {
  flag: "france" | "luxembourg" | "uae" | "poles";
  value: string;
  label: string;
  countUp?: number;
};

export type ApexMessages = {
  meta: {
    title: string;
    description: string;
  };
  nav: {
    links: { label: string; id: string }[];
    cta: string;
    homeAria: string;
    langAria: string;
  };
  hero: {
    eyebrow: string;
    title: ApexTitleLine[];
    subtitle: string[];
    ctas: {
      primary: string;
      secondary: string;
    };
    scrollAria: string;
    marquee: string[];
  };
  heroPanel: {
    glance: string;
    items: ApexHeroPanelItem[];
    foot: string;
  };
  expertises: {
    tag: string;
    title: [string, string];
    intro: string;
    items: {
      num: string;
      title: string;
      en: string;
      desc: string;
      tags: string[];
    }[];
  };
  convictions: {
    tag: string;
    title: [string, string];
    intro: string;
    items: {
      num: string;
      name: string;
      text: string;
      keywords: string[];
    }[];
  };
  audiences: {
    tag: string;
    title: [string, string];
    quote: string;
    items: {
      num: string;
      title: string;
      text: string;
    }[];
  };
  contact: {
    tag: string;
    title: [string, string, string];
    intro: string;
    button: string;
  };
  footer: {
    description: string;
    legal: string;
  };
  sectionCtas: ApexSectionCtas;
};
