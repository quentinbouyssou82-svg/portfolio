/**
 * Identité légale Driveely — source unique pour les marqueurs résiduels des docs.
 *
 * Éditeur / responsable confirmé : Quentin Bouyssou.
 * Contact officiel : contactdriveelyai@gmail.com
 *
 * Ne pas réintroduire SIREN/SIRET/adresse/TVA tant que Quentin ne les a pas
 * confirmés pour l'éditeur actuel (les anciennes valeurs Mikael / Montauban
 * ne doivent plus être publiées).
 *
 * `applyLegalEntityPlaceholders()` remplace les marqueurs `[…]` s'ils
 * réapparaissent. Les variables d'env optionnelles restent prioritaires.
 */

export type LegalEntityField = {
  /** Marqueur exact tel qu'écrit dans les .md */
  marker: string;
  /** Valeur affichée */
  value: string;
  /** true = donnée encore à confirmer par le responsable avant commercialisation */
  provisional: boolean;
  note?: string;
};

/**
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
  commercialName: "Driveely",
  publisher: "Quentin Bouyssou",
  director: "Quentin Bouyssou",
  contactEmail: "contactdriveelyai@gmail.com",
  siteUrl: "https://www.driveely.app",
  /** Non confirmés pour l'éditeur actuel — ne pas afficher de valeurs inventées */
  siren: process.env.DRIVEELY_LEGAL_SIREN?.trim() || "",
  siret: process.env.DRIVEELY_LEGAL_SIRET?.trim() || "",
  professionalAddress: process.env.DRIVEELY_LEGAL_ADDRESS?.trim() || "",
  vat: process.env.DRIVEELY_LEGAL_VAT?.trim() || "",
  fields: [
    {
      marker: "[DATE À COMPLÉTER]",
      value: process.env.DRIVEELY_LEGAL_UPDATED_AT?.trim() || "21 octobre 2026",
      provisional: false,
      note: "Date de mise à jour du document",
    },
    {
      marker: "[ADRESSE PROFESSIONNELLE — À COMPLÉTER]",
      value:
        process.env.DRIVEELY_LEGAL_ADDRESS?.trim() ||
        "adresse professionnelle communiquée sur demande à contactdriveelyai@gmail.com",
      provisional: !process.env.DRIVEELY_LEGAL_ADDRESS?.trim(),
      note: "À confirmer par Quentin avant publication commerciale",
    },
    {
      marker: "[ADRESSE — À COMPLÉTER]",
      value:
        process.env.DRIVEELY_LEGAL_ADDRESS?.trim() ||
        "adresse professionnelle communiquée sur demande à contactdriveelyai@gmail.com",
      provisional: !process.env.DRIVEELY_LEGAL_ADDRESS?.trim(),
    },
    {
      marker: "[SIREN — EN COURS D'IMMATRICULATION]",
      value:
        process.env.DRIVEELY_LEGAL_SIREN?.trim() ||
        "à confirmer par le responsable avant publication",
      provisional: !process.env.DRIVEELY_LEGAL_SIREN?.trim(),
    },
    {
      marker: "[SIRET — EN COURS D'IMMATRICULATION]",
      value:
        process.env.DRIVEELY_LEGAL_SIRET?.trim() ||
        "à confirmer par le responsable avant publication",
      provisional: !process.env.DRIVEELY_LEGAL_SIRET?.trim(),
    },
    {
      marker: "[NUMÉRO DE TVA — À COMPLÉTER, le cas échéant]",
      value:
        process.env.DRIVEELY_LEGAL_VAT?.trim() ||
        "non communiqué (franchise en base possible — à confirmer)",
      provisional: !process.env.DRIVEELY_LEGAL_VAT?.trim(),
      note: "Optionnel selon régime fiscal",
    },
    {
      marker: "[NOM DU TUTEUR LÉGAL — À COMPLÉTER]",
      value:
        process.env.DRIVEELY_LEGAL_DIRECTOR?.trim() || "Quentin Bouyssou",
      provisional: false,
      note: "Responsable / éditeur / directeur de la publication",
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
