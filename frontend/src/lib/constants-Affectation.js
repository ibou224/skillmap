import { Target, Briefcase, GraduationCap, Clock } from "lucide-react";

// ── Statuts d'affectation ────────────────────────────────────────────────────
export const STATUT = {
  FINALISEE: {
    label: "Finalisée",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot:   "bg-emerald-500",
    color: "text-emerald-600",
  },
  AJUSTEE: {
    label: "Ajustée",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    dot:   "bg-blue-500",
    color: "text-blue-600",
  },
  PROPOSEE: {
    label: "Proposée",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    dot:   "bg-amber-500",
    color: "text-amber-600",
  },
};

// ── Pondérations configurables — CDC section 2.2 / Fonctionnalité 4 ─────────
export const PONDERATIONS_DEFAUT = {
  competences: { label: "Compétences", weight: 40, min: 20, max: 60, icon: Target       },
  experience:  { label: "Expérience",  weight: 25, min: 10, max: 40, icon: Briefcase    },
  formation:   { label: "Formation",   weight: 20, min: 10, max: 35, icon: GraduationCap },
  historique:  { label: "Historique",  weight: 15, min: 0,  max: 30, icon: Clock        },
};

export const MOCK_PROGRAMS = [
  { id: "p1", code: "PI",  nom: "Programmation informatique"                },
  { id: "p2", code: "IAI", nom: "Intelligence artificielle et informatique" },
  { id: "p3", code: "RS",  nom: "Réseaux et sécurité"                       },
];

export const MOCK_COURSES = [
  { id: "c1", code: "420-1A3", nom: "Programmation Web",     etape: 1, duree: 3 },
  { id: "c2", code: "420-2B4", nom: "Base de données",       etape: 2, duree: 3 },
  { id: "c3", code: "420-3C5", nom: "IA Appliquée",          etape: 3, duree: 4 },
  { id: "c4", code: "420-4E7", nom: "Réseaux Informatiques", etape: 4, duree: 3 },
  { id: "c5", code: "420-5F8", nom: "Sécurité Informatique", etape: 5, duree: 3 },
];

export const MOCK_PROFESSORS = [
  {
    id: "prof1", prenom: "Jean", nom: "Dupont",
    email: "jean.dupont@cegep.qc.ca",
    competences: ["JavaScript", "React", "Node.js"],
    experience: 8, formation: "Maîtrise",
    historique: ["420-1A3", "420-2B4"],
  },
  {
    id: "prof2", prenom: "Marie", nom: "Curie",
    email: "marie.curie@cegep.qc.ca",
    competences: ["Python", "Machine Learning", "TensorFlow"],
    experience: 12, formation: "Doctorat",
    historique: ["420-3C5"],
  },
  {
    id: "prof3", prenom: "Paul", nom: "Martin",
    email: "paul.martin@cegep.qc.ca",
    competences: ["Cisco", "Sécurité", "Linux"],
    experience: 6, formation: "Baccalauréat",
    historique: [],
  },
  {
    id: "prof4", prenom: "Sophie", nom: "Lefebvre",
    email: "sophie.lefebvre@cegep.qc.ca",
    competences: ["SQL", "PostgreSQL", "MongoDB"],
    experience: 5, formation: "Maîtrise",
    historique: ["420-2B4"],
  },
];
