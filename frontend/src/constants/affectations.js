import { Target, Briefcase, GraduationCap, Clock } from "lucide-react";
import { WEIGHT_BOUNDS } from "@/lib/validation";

export { STATUT } from "@/constants/constantes";

// Les bornes min/max viennent de WEIGHT_BOUNDS (validation.js) — source de vérité unique.
// Modifier les bornes côté serveur (validation.js) suffit ; l'UI se met à jour automatiquement.
export const PONDERATIONS_DEFAUT = {
  competences: { label: "Compétences", weight: 40, ...WEIGHT_BOUNDS.competencesPct, icon: Target        },
  experience:  { label: "Expérience",  weight: 25, ...WEIGHT_BOUNDS.experiencePct,  icon: Briefcase     },
  formation:   { label: "Formation",   weight: 20, ...WEIGHT_BOUNDS.formationPct,   icon: GraduationCap },
  historique:  { label: "Historique",  weight: 15, ...WEIGHT_BOUNDS.historiquePct,  icon: Clock         },
};
