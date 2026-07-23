import { DRIVEELY_BASE } from "@/lib/margeo/routes";

export type DriveelyLegalDocId =
  | "mentions-legales"
  | "confidentialite"
  | "cgu"
  | "cgv"
  | "cookies"
  | "conditions-beta"
  | "remboursement"
  | "demandes-rgpd"
  | "suppression-donnees"
  | "securite-donnees"
  | "abonnements-stripe"
  | "propriete-intellectuelle"
  | "charte-utilisation";

export type DriveelyLegalDocument = {
  id: DriveelyLegalDocId;
  /** Nom de fichier dans content/driveely/legal */
  file: string;
  title: string;
  description: string;
  /** Chemin public sous /demos/driveely */
  path: string;
  /** Affiché dans le footer principal */
  inFooter?: boolean;
  footerLabel?: string;
};

export const DRIVEELY_LEGAL_DOCUMENTS: DriveelyLegalDocument[] = [
  {
    id: "mentions-legales",
    file: "01-mentions-legales.md",
    title: "Mentions légales",
    description: "Informations légales sur l'éditeur du Service Driveely.",
    path: `${DRIVEELY_BASE}/mentions-legales`,
    inFooter: true,
    footerLabel: "Mentions légales",
  },
  {
    id: "confidentialite",
    file: "02-politique-confidentialite.md",
    title: "Politique de confidentialité",
    description:
      "Comment Driveely collecte, utilise et protège vos données personnelles (RGPD).",
    path: `${DRIVEELY_BASE}/confidentialite`,
    inFooter: true,
    footerLabel: "Politique de confidentialité",
  },
  {
    id: "cgu",
    file: "03-cgu.md",
    title: "Conditions générales d'utilisation",
    description: "Conditions d'accès et d'utilisation du Service Driveely.",
    path: `${DRIVEELY_BASE}/cgu`,
    inFooter: true,
    footerLabel: "CGU",
  },
  {
    id: "cgv",
    file: "04-cgv.md",
    title: "Conditions générales de vente",
    description: "Conditions d'abonnement et de paiement Driveely.",
    path: `${DRIVEELY_BASE}/cgv`,
    inFooter: true,
    footerLabel: "CGV",
  },
  {
    id: "cookies",
    file: "05-politique-cookies.md",
    title: "Politique de cookies",
    description: "Cookies et traceurs utilisés par Driveely.",
    path: `${DRIVEELY_BASE}/cookies`,
    inFooter: true,
    footerLabel: "Politique de cookies",
  },
  {
    id: "conditions-beta",
    file: "06-conditions-beta-privee.md",
    title: "Conditions de participation à la bêta privée",
    description: "Règles applicables aux utilisateurs de la bêta privée Driveely.",
    path: `${DRIVEELY_BASE}/conditions-beta`,
    inFooter: true,
    footerLabel: "Conditions bêta",
  },
  {
    id: "remboursement",
    file: "07-politique-remboursement.md",
    title: "Politique de remboursement",
    description: "Modalités de remboursement des abonnements Driveely.",
    path: `${DRIVEELY_BASE}/remboursement`,
  },
  {
    id: "demandes-rgpd",
    file: "08-gestion-demandes-rgpd.md",
    title: "Gestion des demandes RGPD",
    description: "Comment exercer vos droits sur vos données personnelles.",
    path: `${DRIVEELY_BASE}/demandes-rgpd`,
  },
  {
    id: "suppression-donnees",
    file: "09-politique-suppression-donnees.md",
    title: "Politique de suppression des données",
    description: "Durées et modalités de suppression des données Driveely.",
    path: `${DRIVEELY_BASE}/suppression-donnees`,
  },
  {
    id: "securite-donnees",
    file: "10-politique-securite-donnees.md",
    title: "Politique de sécurité des données",
    description: "Mesures de sécurité mises en œuvre par Driveely.",
    path: `${DRIVEELY_BASE}/securite-donnees`,
  },
  {
    id: "abonnements-stripe",
    file: "11-mentions-abonnements-stripe.md",
    title: "Mentions relatives aux abonnements Stripe",
    description: "Informations sur le paiement et les abonnements via Stripe.",
    path: `${DRIVEELY_BASE}/abonnements-stripe`,
  },
  {
    id: "propriete-intellectuelle",
    file: "12-politique-propriete-intellectuelle.md",
    title: "Politique de propriété intellectuelle",
    description: "Droits de propriété intellectuelle relatifs au Service Driveely.",
    path: `${DRIVEELY_BASE}/propriete-intellectuelle`,
  },
  {
    id: "charte-utilisation",
    file: "13-charte-utilisation-acceptable.md",
    title: "Charte d'utilisation acceptable",
    description: "Règles d'usage acceptable du Service Driveely.",
    path: `${DRIVEELY_BASE}/charte-utilisation`,
  },
];

/** Alias d'URL historiques (conditions légales). /beta = page programme produit. */
export const DRIVEELY_LEGAL_ALIASES: Record<string, DriveelyLegalDocId> = {
  // volontairement vide : /beta n'est plus un alias légal
};

const FILE_TO_PATH: Record<string, string> = Object.fromEntries(
  DRIVEELY_LEGAL_DOCUMENTS.map((d) => [d.file, d.path]),
);

export function getLegalDocument(id: DriveelyLegalDocId): DriveelyLegalDocument {
  const doc = DRIVEELY_LEGAL_DOCUMENTS.find((d) => d.id === id);
  if (!doc) throw new Error(`Unknown legal doc: ${id}`);
  return doc;
}

/** Réécrit les liens relatifs ./xx.md vers les routes du site. */
export function rewriteLegalMarkdownLinks(markdown: string): string {
  return markdown.replace(
    /\]\(\.\/([^)]+\.md)\)/g,
    (_full, file: string) => {
      const target = FILE_TO_PATH[file];
      return target ? `](${target})` : `](./${file})`;
    },
  );
}
