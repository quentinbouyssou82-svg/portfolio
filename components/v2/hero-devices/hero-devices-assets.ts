export const PHONE_SCREEN_LIGHT = "/projects/nova-habitat-mobile.png";
export const PHONE_SCREEN_DARK = "/projects/nocta-v2-mobile-dark.png";

export type PhoneScreenConfig = {
  src: string;
  /** 1 = taille max, plus bas = image plus petite (marges noires) */
  inset: number;
};

export const PHONE_SCREEN_CONFIG: Record<"dark" | "light", PhoneScreenConfig> = {
  light: { src: PHONE_SCREEN_LIGHT, inset: 0.55 },
  dark: { src: PHONE_SCREEN_DARK, inset: 0.55 },
};

/** @deprecated use getPhoneScreenConfig */
export const PHONE_SCREEN = PHONE_SCREEN_LIGHT;

export function getPhoneScreenConfig(theme: "dark" | "light"): PhoneScreenConfig {
  return PHONE_SCREEN_CONFIG[theme];
}

export function getPhoneScreen(theme: "dark" | "light") {
  return getPhoneScreenConfig(theme).src;
}
