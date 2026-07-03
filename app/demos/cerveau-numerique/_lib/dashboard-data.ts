/* Static configuration for the connected app (dashboard) views.
   Mirrors the real app's structure; no backend — everything is local UI state. */

export type ViewId =
  | "home"
  | "mails"
  | "tasks"
  | "agenda"
  | "documents"
  | "search"
  | "chat"
  | "suggestions"
  | "settings";

/* Task categories (from the "Nouvelle tâche" modal select) */
export const TASK_CATEGORIES = [
  { value: "administratif", label: "🏛️ administratif" },
  { value: "assurance", label: "🛡️ assurance" },
  { value: "autre", label: "📋 autre" },
  { value: "banque", label: "🏦 banque" },
  { value: "contrat", label: "📄 contrat" },
  { value: "facture", label: "🧾 facture" },
  { value: "famille", label: "👨‍👩‍👧 famille" },
  { value: "impots", label: "🏛️ impots" },
  { value: "logement", label: "🏠 logement" },
  { value: "pro", label: "💼 pro" },
];

export const RECURRENCE_OPTIONS = [
  { value: "none", label: "Pas de récurrence" },
  { value: "daily", label: "Tous les jours" },
  { value: "weekly", label: "Toutes les semaines" },
  { value: "monthly", label: "Tous les mois" },
  { value: "yearly", label: "Tous les ans" },
];

/* Task priority legend used in the modal + filters */
export const PRIORITY_LEGEND = [
  { dot: "#a855f7", label: "En retard" },
  { dot: "#ef4444", label: "Urgent (aujourd'hui)" },
  { dot: "#eab308", label: "Important (≤3j)" },
  { dot: "#3b82f6", label: "Sous 7 jours" },
  { dot: "#22c55e", label: "Sous 1 mois" },
  { dot: "#9ca3af", label: "Quand tu veux" },
];

export const TASK_FILTERS = [
  { id: "all", label: "Toutes" },
  { id: "late", label: "En retard", emoji: "🟣" },
  { id: "urgent", label: "Urgentes", emoji: "🔴" },
  { id: "important", label: "Importantes", emoji: "🟡" },
  { id: "week", label: "Cette semaine", emoji: "📅" },
  { id: "done", label: "Terminées", emoji: "✅" },
];

/* Universal search — type filters */
export const SEARCH_TYPES = [
  { id: "documents", label: "Documents", color: "#4f9eff" },
  { id: "tasks", label: "Tâches", color: "#22c55e" },
  { id: "mails", label: "Mails", color: "#a78bfa" },
  { id: "agenda", label: "Agenda", color: "#fbbf24" },
];

export const SEARCH_SUGGESTIONS = [
  "facture EDF",
  "réunion client",
  "trail inscription",
  "contrat assurance",
];

/* Chat MCP suggested prompts */
export const CHAT_PROMPTS = [
  "Quels emails importants n'ont pas été traités cette semaine ?",
  "Montre-moi mes tâches urgentes",
  "Qu'est-ce que j'ai prévu cette semaine ?",
  "Cherche mes documents de factures",
  "Crée une tâche : rappel renouvellement assurance auto",
];

/* Agenda view modes */
export const AGENDA_VIEWS = [
  { value: "day", label: "Jour" },
  { value: "week5", label: "Semaine (5j)" },
  { value: "week7", label: "Semaine (7j)" },
  { value: "month", label: "Mois" },
  { value: "list", label: "Liste" },
];

/* Settings — left navigation */
export const SETTINGS_NAV = [
  { id: "comptes", label: "Comptes", icon: "AtSign" },
  { id: "mails", label: "Mails", icon: "Mail" },
  { id: "documents", label: "Documents", icon: "FileText" },
  { id: "notifications", label: "Notifications", icon: "Bell" },
  { id: "recherche", label: "Recherche", icon: "Search" },
  { id: "chat", label: "Chat IA", icon: "MessageSquare" },
] as const;

/* Settings > Mails > sub-tabs */
export const SETTINGS_MAIL_TABS = [
  "Catégories et vues",
  "Libellés",
  "Règles mails",
  "Dossiers exclus",
  "Profilage IA",
  "Suggestions",
  "Diffusions",
];

export type MailCategory = {
  id: string;
  label: string;
  emoji: string;
  description: string;
  socle?: boolean;
  active: boolean;
};

export const MAIL_CATEGORIES_SOCLE: MailCategory[] = [
  { id: "services", label: "Services & Apps", emoji: "🔔", socle: true, active: true, description: "Notifications système, comptes SaaS, GitHub, iCloud, Dropbox, alertes d'application. Réservé aux vraies notifications de services numériques." },
  { id: "factures", label: "Factures", emoji: "🧾", socle: true, active: true, description: "Preuves de paiement, reçus, relevés bancaires, factures reçues." },
  { id: "commandes", label: "Commandes", emoji: "📦", socle: true, active: true, description: "Confirmations d'achat, récapitulatifs de commande (transaction déjà payée)." },
  { id: "livraisons", label: "Livraisons", emoji: "🚚", socle: true, active: true, description: "Suivi de colis, avis de passage, notifications de livraison (Colissimo, DHL, UPS…)." },
  { id: "newsletters", label: "Newsletters", emoji: "📰", socle: true, active: true, description: "Envois de masse purement informatifs : actualités, hebdos, blogs, digests. Aucune action requise." },
  { id: "promotions", label: "Promotions", emoji: "🏷️", socle: true, active: true, description: "Offres commerciales, soldes, codes promo, ventes privées, deals. Aucune action requise." },
  { id: "spam", label: "Spam", emoji: "🚫", socle: true, active: true, description: "Emails indésirables, phishing, arnaques, expéditeurs non sollicités." },
  { id: "divers", label: "Divers", emoji: "📁", socle: true, active: true, description: "Emails ne correspondant à aucune autre catégorie. Fourre-tout honnête pour les mails non classifiables par l'IA." },
];

export const MAIL_PACK_PARTICULIER: MailCategory[] = [
  { id: "personnel", label: "Personnel", emoji: "👤", active: false, description: "Famille, amis, conversations privées. RDV personnels envoyés pour toi spécifiquement (Calendly, invitations directes)." },
  { id: "administratif", label: "Administratif", emoji: "🏛️", active: false, description: "Impôts, CAF, Sécurité sociale, préfecture, mairie, démarches administratives personnelles." },
  { id: "sante", label: "Santé", emoji: "❤️", active: false, description: "RDV médicaux, résultats d'analyses, mutuelle, pharmacie, remboursements santé." },
  { id: "voyages", label: "Voyages", emoji: "✈️", active: false, description: "Billets d'avion ou de train achetés, réservations d'hôtel, locations de voiture personnelles." },
  { id: "securite", label: "Sécurité", emoji: "🔒", active: false, description: "Codes 2FA, alertes de connexion suspecte, vérifications de compte, réinitialisations de mot de passe." },
];

export const MAIL_PACK_PRO: MailCategory[] = [
  { id: "clients", label: "Clients", emoji: "💼", active: true, description: "Emails de clients existants : demandes, retours, suivi de projets en cours." },
  { id: "prospects", label: "Prospects", emoji: "🎯", active: false, description: "Nouveaux contacts entrants, demandes d'information, prises de contact commerciales." },
  { id: "fournisseurs", label: "Fournisseurs", emoji: "🏭", active: true, description: "Devis, bons de commande, échanges avec vos prestataires et fournisseurs." },
  { id: "rh", label: "RH & Recrutement", emoji: "🧑‍💼", active: true, description: "Candidatures, entretiens, contrats de travail, échanges avec les équipes." },
  { id: "compta", label: "Comptabilité", emoji: "🧮", active: true, description: "Factures fournisseurs, notes de frais, échanges avec l'expert-comptable." },
  { id: "juridique", label: "Juridique", emoji: "⚖️", active: true, description: "Contrats, CGV, mentions légales, échanges avec avocats et notaires." },
];
