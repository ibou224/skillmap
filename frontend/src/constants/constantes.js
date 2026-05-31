/**
 * @module constants/constantes
 * @description Constantes globales de l'application : énumérations Prisma, labels,
 * couleurs, options pour les formulaires et affichage.
 */


import { Snowflake, Sun } from "lucide-react";
import { WEIGHT_BOUNDS } from "@/lib/validation";

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
  ANNULEE:   {
    label: "Annulée",
    dot: "bg-red-400",
    badge: "bg-red-50 text-red-600 border-red-200",
    darkBadge: "dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
  },
};

/** Labels visibles par le professeur — masquent les mécanismes internes */
export const STATUT_PROF = {
  FINALISEE: { label: "Confirmée",       dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  AJUSTEE:   { label: "En traitement",   dot: "bg-blue-500",    badge: "bg-blue-50 text-blue-700 border-blue-200"          },
  PROPOSEE:  { label: "En traitement",   dot: "bg-amber-500",   badge: "bg-amber-50 text-amber-700 border-amber-200"       },
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


export const initialCvData = {
  titre: "",
  prenom: "",
  nom: "",
  email: "",
  telephone: "",
  ville: "",
  siteWeb: "",
  linkedin: "",
  github: "",
  resume: "",
  competences: [],
  langues: [],
  experiences: [],
  formations: [],
  certifications: [],
};

export const ETAPES = [1,2,3,4,5,6,7,8]

// Les bornes min/max viennent de WEIGHT_BOUNDS (validation.js) — source de vérité unique.
export const CRITERES = {
  competencesPct: {
    label: "Compétences techniques",
    description: "Correspondance entre les compétences du professeur et celles requises par le cours",
    icon: "🎯",
    defaut: 40,
    ...WEIGHT_BOUNDS.competencesPct,
    color: "bg-blue-500",
    lightColor: "bg-blue-50",
    textColor: "text-blue-700",
  },
  experiencePct: {
    label: "Années d'expérience",
    description: "Expérience pratique dans le domaine enseigné",
    icon: "⏳",
    defaut: 25,
    ...WEIGHT_BOUNDS.experiencePct,
    color: "bg-emerald-500",
    lightColor: "bg-emerald-50",
    textColor: "text-emerald-700",
  },
  formationPct: {
    label: "Niveau de formation",
    description: "Diplômes et formation académique du professeur",
    icon: "🎓",
    defaut: 20,
    ...WEIGHT_BOUNDS.formationPct,
    color: "bg-purple-500",
    lightColor: "bg-purple-50",
    textColor: "text-purple-700",
  },
  historiquePct: {
    label: "Historique d'enseignement",
    description: "Expérience antérieure avec ce cours spécifique",
    icon: "📚",
    defaut: 15,
    ...WEIGHT_BOUNDS.historiquePct,
    color: "bg-amber-500",
    lightColor: "bg-amber-50",
    textColor: "text-amber-700",
  },
};

export const SAISONS = [
  { value: "Hiver", label: "Hiver" },
  { value: "Ete", label: "Été" },
  { value: "Automne", label: "Automne" },
  { value: "Printemps", label: "Printemps" },
];