/** Abstract motif identifiers — pure SVG, no photographic assets. */
export type ApexAbstractMotif =
  | "hero-atmosphere"
  | "expertise-financement"
  | "expertise-dette"
  | "expertise-patrimoine"
  | "expertise-levee"
  | "conviction-structurer"
  | "conviction-valeur"
  | "conviction-aligner"
  | "audience-dirigeants"
  | "audience-patrimoine"
  | "audience-fonds"
  | "audience-investisseurs";

const unsplash = (id: string, w = 2400) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=82`;

/** Curated premium textures — abstract crops, marble, architecture, golden light. */
export type ApexPhotoAsset = {
  src: string;
  objectPosition?: string;
  sizes?: string;
  quality?: number;
};

export type ApexVisualConfig = {
  motif: ApexAbstractMotif;
  /** Accessible label — decorative visuals use empty string. */
  label: string;
  /** Optional ultra-subtle photo texture behind SVG motif (additive only). */
  photo?: ApexPhotoAsset;
};

export const APEX_PHOTOS = {
  hero: {
    src: unsplash("photo-1618005182384-a83a8bd57fbe"),
    objectPosition: "58% 46%",
    sizes: "100vw",
    quality: 85,
  },
  sectionServices: {
    src: unsplash("photo-1497366216548-37526070297c", 1800),
    objectPosition: "78% 32%",
    sizes: "55vw",
  },
  sectionApproach: {
    src: unsplash("photo-1513506003901-1e6a229e2d15", 1800),
    objectPosition: "42% 38%",
    sizes: "65vw",
  },
  sectionCredibility: {
    src: unsplash("photo-1470071459604-3b5ec3a7fe05", 1800),
    objectPosition: "50% 58%",
    sizes: "72vw",
  },
} as const satisfies Record<string, ApexPhotoAsset>;

const CARD_TEXTURES: Record<ApexAbstractMotif, ApexPhotoAsset | undefined> = {
  "hero-atmosphere": undefined,
  "expertise-financement": {
    src: unsplash("photo-1486406146926-c627a92ad1ab", 1400),
    objectPosition: "50% 18%",
    sizes: "480px",
  },
  "expertise-dette": {
    src: unsplash("photo-1541701494587-cb58502866ab", 1400),
    objectPosition: "55% 45%",
    sizes: "480px",
  },
  "expertise-patrimoine": {
    src: unsplash("photo-1618221195710-dd6b41faaea6", 1400),
    objectPosition: "48% 52%",
    sizes: "480px",
  },
  "expertise-levee": {
    src: unsplash("photo-1503387762-592deb58ef4e", 1400),
    objectPosition: "62% 40%",
    sizes: "480px",
  },
  "conviction-structurer": {
    src: unsplash("photo-1454165804606-c3d57bc86b40", 900),
    objectPosition: "68% 42%",
    sizes: "220px",
  },
  "conviction-valeur": {
    src: unsplash("photo-1513506003901-1e6a229e2d15", 900),
    objectPosition: "50% 50%",
    sizes: "220px",
  },
  "conviction-aligner": {
    src: unsplash("photo-1600210492486-724fe5c67fb0", 900),
    objectPosition: "44% 55%",
    sizes: "220px",
  },
  "audience-dirigeants": {
    src: unsplash("photo-1497366216548-37526070297c", 900),
    objectPosition: "70% 35%",
    sizes: "220px",
  },
  "audience-patrimoine": {
    src: unsplash("photo-1600585154340-be6161a56a0c", 900),
    objectPosition: "50% 60%",
    sizes: "220px",
  },
  "audience-fonds": {
    src: unsplash("photo-1502086223501-7ea6ecd79368", 900),
    objectPosition: "55% 48%",
    sizes: "220px",
  },
  "audience-investisseurs": {
    src: unsplash("photo-1614850523459-c2f4c699c52e", 900),
    objectPosition: "50% 42%",
    sizes: "220px",
  },
};

function withCardTexture(motif: ApexAbstractMotif, label: string): ApexVisualConfig {
  const photo = CARD_TEXTURES[motif];
  return photo ? { motif, label, photo } : { motif, label };
}

export const APEX_VISUALS = {
  hero: { motif: "hero-atmosphere", label: "" } satisfies ApexVisualConfig,
  expertiseCards: [
    withCardTexture("expertise-financement", "Grille structurée — financement"),
    withCardTexture("expertise-dette", "Courbes — dette privée"),
    withCardTexture("expertise-patrimoine", "Ellipses — patrimoine"),
    withCardTexture("expertise-levee", "Trajectoires — levée de fonds"),
  ] satisfies ApexVisualConfig[],
  convictionSteps: [
    withCardTexture("conviction-structurer", "Nœuds — structurer"),
    withCardTexture("conviction-valeur", "Rayonnement — valeur"),
    withCardTexture("conviction-aligner", "Orbite — alignement"),
  ] satisfies ApexVisualConfig[],
  audienceSteps: [
    withCardTexture("audience-dirigeants", "Champ — dirigeants"),
    withCardTexture("audience-patrimoine", "Courbe — patrimoine"),
    withCardTexture("audience-fonds", "Spectre — fonds"),
    withCardTexture("audience-investisseurs", "Treillis — investisseurs"),
  ] satisfies ApexVisualConfig[],
} as const;
