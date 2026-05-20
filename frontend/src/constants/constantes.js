/**
 * @module constants/constantes
 * @description Constantes globales de l'application : énumérations Prisma, labels,
 * couleurs, options pour les formulaires et affichage.
 */


import { Snowflake, Sun } from "lucide-react";

export const STATUT = {
  FINALISEE: { 
    label: "Finalisée", 
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    darkBadge: "dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
  },
  AJUSTEE:   { 
    label: "Ajustée",   
    dot: "bg-blue-500",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    darkBadge: "dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
  },
  PROPOSEE:  { 
    label: "Proposée",  
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    darkBadge: "dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"
  },
};

export const PERIODE = {
  AUTOMNE: { 
    label: "Automne", 
    Icon: Snowflake,
    gradient: "from-amber-500 to-orange-600",
    lightBg: "bg-amber-50",
    lightText: "text-amber-600",
    darkBg: "dark:bg-amber-900/20",
    darkText: "dark:text-amber-400"
  },
  HIVER:   { 
    label: "Hiver",   
    Icon: Snowflake,
    gradient: "from-blue-500 to-indigo-600",
    lightBg: "bg-blue-50",
    lightText: "text-blue-600",
    darkBg: "dark:bg-blue-900/20",
    darkText: "dark:text-blue-400"
  },
  ETE:     { 
    label: "Été",     
    Icon: Sun,
    gradient: "from-yellow-500 to-orange-500",
    lightBg: "bg-yellow-50",
    lightText: "text-yellow-600",
    darkBg: "dark:bg-yellow-900/20",
    darkText: "dark:text-yellow-400"
  },
};

export const LABEL_MAPPING = {
  "prénom": "prenom",
  "nom": "nom",
  "email": "email",
  "téléphone": "telephone",
  "ville": "ville",
  "site web": "siteWeb",
  "linkedin": "linkedin",
  "résumé": "resume",
  "compétences": "competences",
  "langues": "langues",
  "formations": "formations",
  "expériences": "experiences",
};

export const initialCvData = {
  prenom: "",
  nom: "",
  email: "",
  telephone: "",
  ville: "",
  siteWeb: "",
  linkedin: "",
  resume: "",
  competences: "",
  langues: "",
  experiences: [],
  formations: [],
};
