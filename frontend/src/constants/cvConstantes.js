import { CheckCircle2, Clock } from "lucide-react";

export const STATUT_META = {
  VALIDATED: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500", label: "Validé"    },
  EXTRACTED: { bg: "bg-amber-100",   text: "text-amber-700",   dot: "bg-amber-500",   label: "À valider" },
  PENDING:   { bg: "bg-blue-100",    text: "text-blue-700",    dot: "bg-blue-500",    label: "En cours"  },
  null:      { bg: "bg-slate-100",   text: "text-slate-500",   dot: "bg-slate-300",   label: "Aucun CV"  },
};

export const FILTER_TABS = [
  { value: "tous",      label: "Tous"       },
  { value: "EXTRACTED", label: "À valider"  },
  { value: "VALIDATED", label: "Validés"    },
  { value: "PENDING",   label: "En cours"   },
  { value: "aucun",     label: "Sans CV"    },
];

export const SORT_OPTIONS = [
  { value: "nom_asc",   label: "Nom A → Z"         },
  { value: "nom_desc",  label: "Nom Z → A"          },
  { value: "cv_recent", label: "CV le plus récent"  },
  { value: "cv_ancien", label: "CV le plus ancien"  },
];


export function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-CA", { day: "2-digit", month: "short", year: "numeric" });
}

export function getStatutMeta(statut) {
  return STATUT_META[statut] ?? STATUT_META["null"];
}

export const NIVEAU_BARS = {
  DEBUTANT:      1,
  INTERMEDIAIRE: 3,
  AVANCE:        4,
  EXPERT:        5,
};

export const NIVEAU_LABEL = {
  DEBUTANT:      "Débutant",
  INTERMEDIAIRE: "Intermédiaire",
  AVANCE:        "Avancé",
  EXPERT:        "Expert",
};

export const DIPLOME_LABEL = {
  DOCTORATE: "Doctorat (Ph.D.)",
  MASTERS:   "Maîtrise",
  BACHELORS: "Baccalauréat",
  DEC:       "DEC",
  OTHER:     "Autre",
  CERTIFICATION: "Certification",
};

export const CV_STATUT_META = {
  VALIDATED: { icon: CheckCircle2, label: "CV validé",            bg: "bg-emerald-100", text: "text-emerald-700" },
  EXTRACTED: { icon: Clock,        label: "En attente de validation", bg: "bg-amber-100",   text: "text-amber-700"  },
};