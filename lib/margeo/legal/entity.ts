/**
 * Identité légale Driveely — source unique pour les placeholders des docs.
 *
 * Quand la micro-entreprise est créée, renseigner les champs `value`
 * (ou les variables d'environnement documentées). Les markdown utilisent
 * les marqueurs `[…]` ; `applyLegalEntityPlaceholders()` les remplace au chargement.
 */

export type LegalEntityField = {
  /** Marqueur exact tel qu'écrit dans les .md */
  marker: string;
  /** Valeur affichée (placeholder tant que null / vide) */
  value: string;
  /** true = donnée provisoire à remplacer avant commercialisation */
  provisional: boolean;
  note?: string;
};

/**
 * Renseigner ici (ou via env) dès que l'immatriculation est faite.
 * Env optionnelles (prioritaires si définies) :
 * - DRIVEELY_LEGAL_SIREN
 * - DRIVEELY_LEGAL_SIRET
 * - DRIVEELY_LEGAL_ADDRESS
 * - DRIVEELY_LEGAL_DIRECTOR
 * - DRIVEELY_LEGAL_VAT
 * - DRIVEELY_LEGAL_UPDATED_AT
 */
export const DRIVEELY_LEGAL_ENTITY = {
  tradeName: "Driveely",
  projectLead: "Leandro Machado",
  contactEmail: "contact@driveely.app",
  siteUrl: "https://driveely.app",
  fields: [
    {
      marker: "[DATE À COMPLÉTER]",
      value:
        process.env.DRIVEELY_LEGAL_UPDATED_AT?.trim() ||
        "[DATE À COMPLÉTER]",
      provisional: !process.env.DRIVEELY_LEGAL_UPDATED_AT?.trim(),
      note: "Date de mise à jour du document",
    },
    {
      marker: "[ADRESSE PROFESSIONNELLE — À COMPLÉTER]",
      value:
        process.env.DRIVEELY_LEGAL_ADDRESS?.trim() ||
        "[ADRESSE PROFESSIONNELLE — À COMPLÉTER]",
      provisional: !process.env.DRIVEELY_LEGAL_ADDRESS?.trim(),
    },
    {
      marker: "[ADRESSE — À COMPLÉTER]",
      value:
        process.env.DRIVEELY_LEGAL_ADDRESS?.trim() ||
        "[ADRESSE — À COMPLÉTER]",
      provisional: !process.env.DRIVEELY_LEGAL_ADDRESS?.trim(),
    },
    {
      marker: "[SIREN — EN COURS D'IMMATRICULATION]",
      value:
        process.env.DRIVEELY_LEGAL_SIREN?.trim() ||
        "[SIREN — EN COURS D'IMMATRICULATION]",
      provisional: !process.env.DRIVEELY_LEGAL_SIREN?.trim(),
    },
    {
      marker: "[SIRET — EN COURS D'IMMATRICULATION]",
      value:
        process.env.DRIVEELY_LEGAL_SIRET?.trim() ||
        "[SIRET — EN COURS D'IMMATRICULATION]",
      provisional: !process.env.DRIVEELY_LEGAL_SIRET?.trim(),
    },
    {
      marker: "[NUMÉRO DE TVA — À COMPLÉTER, le cas échéant]",
      value:
        process.env.DRIVEELY_LEGAL_VAT?.trim() ||
        "[NUMÉRO DE TVA — À COMPLÉTER, le cas échéant]",
      provisional: !process.env.DRIVEELY_LEGAL_VAT?.trim(),
    },
    {
      marker: "[NOM DU TUTEUR LÉGAL — À COMPLÉTER]",
      value:
        process.env.DRIVEELY_LEGAL_DIRECTOR?.trim() ||
        "[NOM DU TUTEUR LÉGAL — À COMPLÉTER]",
      provisional: !process.env.DRIVEELY_LEGAL_DIRECTOR?.trim(),
      note: "Responsable légal de la micro-entreprise",
    },
    {
      marker: "[ADRESSE DE VERCEL INC. — À COMPLÉTER]",
      value: "440 N Barranca Ave #4133, Covina, CA 91723, United States",
      provisional: false,
      note: "Adresse publique Vercel (hébergeur frontend)",
    },
    {
      marker: "[ADRESSE DE SUPABASE INC. — À COMPLÉTER]",
      value: "970 Toa Payoh North #07-04, Singapore 318992",
      provisional: false,
      note: "Adresse publique Supabase (hébergeur données)",
    },
  ] as const satisfies readonly LegalEntityField[],
} as const;

/** Remplace les marqueurs connus dans un markdown juridique. */
export function applyLegalEntityPlaceholders(markdown: string): string {
  let out = markdown;
  for (const field of DRIVEELY_LEGAL_ENTITY.fields) {
    if (field.marker && out.includes(field.marker)) {
      out = out.split(field.marker).join(field.value);
    }
  }
  return out;
}

/** Liste des champs encore provisoires (utile pour audits / admin). */
export function listProvisionalLegalFields(): LegalEntityField[] {
  return DRIVEELY_LEGAL_ENTITY.fields.filter((f) => f.provisional);
}
