import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Brain,
  CircleCheckBig,
  FileText,
  Mail,
  Shield,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";

export const landingStats = [
  { value: "100%", label: "Documents classés automatiquement" },
  { value: "0 €", label: "Coût mensuel" },
  { value: "10+", label: "Intégrations disponibles" },
  { value: "7h00", label: "Récap matinal" },
] as const;

export type FeatureItem = {
  title: string;
  description: string;
  icon: LucideIcon;
  iconClass: string;
  iconBg: string;
  iconBorder: string;
};

export const landingFeatures: FeatureItem[] = [
  {
    title: "GED Intelligente",
    description:
      "Classe automatiquement tes factures, contrats et documents administratifs. Retrouve n'importe quoi en 2 secondes.",
    icon: FileText,
    iconClass: "text-blue-400",
    iconBg: "rgba(79,158,255,0.1)",
    iconBorder: "rgba(79,158,255,0.2)",
  },
  {
    title: "To-Do Proactive",
    description:
      "L'IA analyse tes documents et ta vie pour créer une to-do list intelligente, avec guidage étape par étape.",
    icon: CircleCheckBig,
    iconClass: "text-emerald-400",
    iconBg: "rgba(52,211,153,0.1)",
    iconBorder: "rgba(52,211,153,0.2)",
  },
  {
    title: "Récap Matinal 7h",
    description:
      "Chaque matin, un résumé de tes priorités du jour, alertes mails et suggestions personnalisées.",
    icon: Bell,
    iconClass: "text-yellow-400",
    iconBg: "rgba(251,191,36,0.1)",
    iconBorder: "rgba(251,191,36,0.2)",
  },
  {
    title: "Gmail Intelligent",
    description:
      "Trie ta boite mail, propose des brouillons de réponse et te relance sur les mails non traités.",
    icon: Mail,
    iconClass: "text-purple-400",
    iconBg: "rgba(167,139,250,0.1)",
    iconBorder: "rgba(167,139,250,0.2)",
  },
  {
    title: "Veille & Économies",
    description:
      "Compare tes contrats en cours avec le marché et détecte automatiquement où tu peux économiser — énergie, assurances, abonnements et plus.",
    icon: TrendingUp,
    iconClass: "text-orange-400",
    iconBg: "rgba(251,146,60,0.1)",
    iconBorder: "rgba(251,146,60,0.2)",
  },
  {
    title: "Proactivité Intelligente",
    description:
      "L'app apprend ton mode de vie et programme automatiquement ce qu'il faut faire avant que tu n'y penses — selon la saison, tes contraintes et tes habitudes.",
    icon: Zap,
    iconClass: "text-pink-400",
    iconBg: "rgba(244,114,182,0.1)",
    iconBorder: "rgba(244,114,182,0.2)",
  },
];

export const landingIcons = { Star, Brain, Shield } as const;

export const documentCategories = [
  "Factures",
  "Contrats",
  "Administratif",
  "Assurances",
  "Impôts",
  "Autre",
] as const;

export const onboardingSteps = [
  {
    title: "Bienvenue",
    description: "Comment veux-tu qu'on t'appelle ?",
  },
  {
    title: "Tes priorités",
    description: "Qu'est-ce que tu veux organiser en premier ?",
  },
  {
    title: "C'est parti",
    description: "Ton cerveau numérique est prêt.",
  },
] as const;

export const navItems = [
  { href: "dashboard", label: "Accueil", icon: Brain },
  { href: "documents", label: "Documents", icon: FileText },
  { href: "todos", label: "Tâches", icon: CircleCheckBig },
  { href: "recap", label: "Récap 7h", icon: Bell },
] as const;
