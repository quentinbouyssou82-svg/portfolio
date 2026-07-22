/**
 * Corrige le statut juridique dans les documents Driveely :
 * SASU / Président mineur → micro-entreprise dirigée par le tuteur légal.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(__dirname, "../content/driveely/legal");

const ENTITY_SHORT =
  "Driveely, micro-entreprise [SIREN — EN COURS D'IMMATRICULATION]";
const ENTITY_LONG =
  "activité exploitée sous le régime de la micro-entreprise française";

function rewriteMentions(content: string): string {
  return content
    .replace(
      /\*\*Driveely\*\*, société par actions simplifiée unipersonnelle \(SASU\) en cours d'immatriculation\n- Siège social : \[ADRESSE DU SIÈGE SOCIAL — À COMPLÉTER\]\n- Capital social : \[MONTANT DU CAPITAL SOCIAL — À COMPLÉTER\]\n- SIREN : \[SIREN — EN COURS D'IMMATRICULATION\]\n- SIRET : \[SIRET — EN COURS D'IMMATRICULATION\]\n- RCS : \[VILLE D'IMMATRICULATION — À COMPLÉTER\]\n- Numéro de TVA intracommunautaire : \[NUMÉRO DE TVA — À COMPLÉTER, le cas échéant\]\n- Président : Leandro Machado\n\n\*Précision relative à la capacité juridique du Président : M\. Leandro Machado, mineur non émancipé à la date de rédaction des présentes, agit en qualité de Président de la SASU Driveely avec l'autorisation de ses représentants légaux, conformément à l'acte d'autorisation parentale d'exercer une activité commerciale n° \[RÉFÉRENCE — À COMPLÉTER\] en date du \[DATE — À COMPLÉTER\]\. Cette autorisation est tenue à disposition de toute autorité compétente qui en ferait la demande\.\*/,
      `**Driveely**, ${ENTITY_LONG}, en cours d'immatriculation
- Nom commercial / enseigne : Driveely
- Siège / adresse professionnelle : [ADRESSE PROFESSIONNELLE — À COMPLÉTER]
- SIREN : [SIREN — EN COURS D'IMMATRICULATION]
- SIRET : [SIRET — EN COURS D'IMMATRICULATION]
- Numéro de TVA intracommunautaire : [NUMÉRO DE TVA — À COMPLÉTER, le cas échéant]
- Entrepreneur individuel (responsable légal de la micro-entreprise) : [NOM DU TUTEUR LÉGAL — À COMPLÉTER]
- Porteur du projet (non représentant légal) : Leandro Machado

*Précision relative à l'organisation juridique : l'activité Driveely est exploitée par une micro-entreprise française créée et dirigée par le tuteur légal de M. Leandro Machado (son père), qui en est le responsable légal. M. Leandro Machado participe au développement et au projet en qualité de porteur du projet, sans être le représentant légal de la micro-entreprise.*`,
    )
    .replace(
      /Le directeur de la publication est M\. Leandro Machado, Président de la SASU Driveely, agissant conformément à l'autorisation visée à l'article 1 ci-dessus\./,
      "Le directeur de la publication est [NOM DU TUTEUR LÉGAL — À COMPLÉTER], responsable légal de la micro-entreprise exploitant le Service Driveely. M. Leandro Machado contribue au projet en qualité de porteur du projet, sans être le représentant légal de l'entreprise.",
    );
}

function rewriteGeneric(content: string, file: string): string {
  let out = content;

  out = out.replace(
    /édité par la SASU Driveely \[SIREN — EN COURS D'IMMATRICULATION\]/g,
    "édité par Driveely, micro-entreprise [SIREN — EN COURS D'IMMATRICULATION]",
  );
  out = out.replace(
    /édité par Driveely, SASU \[SIREN — EN COURS D'IMMATRICULATION\]/g,
    "édité par Driveely, micro-entreprise [SIREN — EN COURS D'IMMATRICULATION]",
  );
  out = out.replace(
    /Driveely, SASU \[SIREN — EN COURS D'IMMATRICULATION\]/g,
    ENTITY_SHORT,
  );
  out = out.replace(
    /Driveely, SASU en cours d'immatriculation/g,
    "Driveely, micro-entreprise en cours d'immatriculation",
  );
  out = out.replace(
    /applicables à Driveely, SASU/g,
    "applicables à Driveely, micro-entreprise",
  );
  out = out.replace(
    /édité par Driveely, SASU \[SIREN — EN COURS D'IMMATRICULATION\]/g,
    `édité par ${ENTITY_SHORT}`,
  );

  if (file === "01-mentions-legales.md") {
    out = rewriteMentions(out);
  }

  if (file === "00-README.md") {
    out = `# Documents juridiques Driveely — Récapitulatif

Ce dossier contient les 13 documents juridiques nécessaires au lancement de la bêta privée puis de la commercialisation d'Driveely en France, cohérents entre eux et fondés sur la structure retenue : **micro-entreprise française** exploitant l'enseigne Driveely, **dirigée par le tuteur légal** de Leandro Machado (son père). Leandro Machado est le **porteur du projet** (développement / opérationnel) mais **n'est pas le représentant légal** de la micro-entreprise.

## Liste des documents

| # | Document | Fichier |
|---|---|---|
| 1 | Mentions légales | \`01-mentions-legales.md\` |
| 2 | Politique de confidentialité (RGPD) | \`02-politique-confidentialite.md\` |
| 3 | Conditions Générales d'Utilisation | \`03-cgu.md\` |
| 4 | Conditions Générales de Vente | \`04-cgv.md\` |
| 5 | Politique de cookies | \`05-politique-cookies.md\` |
| 6 | Conditions de participation à la bêta privée | \`06-conditions-beta-privee.md\` |
| 7 | Politique de remboursement | \`07-politique-remboursement.md\` |
| 8 | Gestion des demandes RGPD | \`08-gestion-demandes-rgpd.md\` |
| 9 | Politique de suppression des données | \`09-politique-suppression-donnees.md\` |
| 10 | Politique de sécurité des données | \`10-politique-securite-donnees.md\` |
| 11 | Mentions relatives aux abonnements Stripe | \`11-mentions-abonnements-stripe.md\` |
| 12 | Politique de propriété intellectuelle | \`12-politique-propriete-intellectuelle.md\` |
| 13 | Charte d'utilisation acceptable | \`13-charte-utilisation-acceptable.md\` |

## ⚠️ Point juridique prioritaire — organisation de l'activité

Ces documents sont rédigés sur la base de l'option **micro-entreprise dirigée par le tuteur légal**. Concrètement, avant toute publication :

1. **Créer / immatriculer la micro-entreprise** au nom du tuteur légal (père de Leandro Machado), qui en sera le responsable légal.
2. **Obtenir SIREN / SIRET** et renseigner l'adresse professionnelle.
3. **Clarifier en interne** le rôle de Leandro Machado (porteur du projet / contribution opérationnelle) sans confusion avec la représentation légale.
4. Vérifier auprès d'un professionnel du droit (avocat ou expert-comptable) la rédaction des documents et la conformité fiscale / sociale de la micro-entreprise.

**Ces documents constituent une base rédactionnelle avancée mais ne remplacent pas la vérification par un avocat inscrit au barreau avant publication.**

## Placeholders à compléter avant publication

Recherche la mention \`[...]\` dans chaque fichier. Les principaux points à renseigner :

- \`[DATE À COMPLÉTER]\` — date de mise en ligne de chaque document
- \`[ADRESSE PROFESSIONNELLE — À COMPLÉTER]\` / \`[ADRESSE — À COMPLÉTER]\`
- \`[NOM DU TUTEUR LÉGAL — À COMPLÉTER]\` — responsable légal de la micro-entreprise
- \`[SIREN]\` / \`[SIRET]\`
- \`[NUMÉRO DE TVA]\` (le cas échéant)
- Adresses de Vercel Inc. et Supabase Inc. (à récupérer sur leurs pages légales respectives)

## Cohérence entre les documents

Les documents se renvoient mutuellement. Si tu renommes un fichier, mets à jour les liens correspondants.

## Évolutions prévues à anticiper

Ces documents contiennent déjà des clauses "à venir" pour :
- Google Login / Apple Login
- Google Analytics
- Activation des paiements Stripe (fin de gratuité de la bêta)

Il faudra les activer/compléter (et non les réécrire entièrement) au moment du déploiement de ces fonctionnalités.
`;
  }

  // Residual SASU / capital / RCS société
  out = out.replace(/\bSASU\b/g, "micro-entreprise");
  out = out.replace(/\bEURL\b/g, "micro-entreprise");

  return out;
}

for (const file of fs.readdirSync(DIR).filter((f) => f.endsWith(".md"))) {
  const full = path.join(DIR, file);
  const raw = fs.readFileSync(full, "utf8");
  const next = rewriteGeneric(raw, file);
  fs.writeFileSync(full, next);
  console.log("updated", file);
}

// Verify no residual bad patterns
const bad = ["Président de la SASU", "SASU Driveely", "dirigeant mineur", "acte d'autorisation parentale d'exercer"];
for (const file of fs.readdirSync(DIR).filter((f) => f.endsWith(".md"))) {
  const text = fs.readFileSync(path.join(DIR, file), "utf8");
  for (const b of bad) {
    if (text.includes(b)) console.warn("STILL HAS", b, "in", file);
  }
  if (/\bSASU\b/.test(text)) console.warn("STILL HAS SASU in", file);
}
