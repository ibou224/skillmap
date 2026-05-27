import { Target, Briefcase, GraduationCap, Clock } from "lucide-react";

export { STATUT } from "@/constants/constantes";

export const PONDERATIONS_DEFAUT = {
  competences: { label: "Compétences", weight: 40, min: 20, max: 60, icon: Target       },
  experience:  { label: "Expérience",  weight: 25, min: 10, max: 40, icon: Briefcase    },
  formation:   { label: "Formation",   weight: 20, min: 10, max: 35, icon: GraduationCap },
  historique:  { label: "Historique",  weight: 15, min: 0,  max: 30, icon: Clock        },
};
