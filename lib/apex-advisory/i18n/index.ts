import { en } from "./en";
import { fr } from "./fr";
import type { ApexLocale, ApexMessages } from "./types";

export type { ApexLocale, ApexMessages } from "./types";
export {
  APEX_DEFAULT_LOCALE,
  APEX_LOCALE_STORAGE_KEY,
  APEX_LOCALES,
} from "./types";
export type {
  ApexSectionCtaItem,
  ApexSectionCtaVariant,
  ApexSectionCtas,
} from "./types";

export const apexMessages: Record<ApexLocale, ApexMessages> = { fr, en };

export function getApexMessages(locale: ApexLocale): ApexMessages {
  return apexMessages[locale];
}
