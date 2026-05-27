export const ROLE_STYLE = {
  ADMIN:      "bg-slate-100 text-slate-700",
  RH:         "bg-blue-100 text-blue-700",
  PROFESSEUR: "bg-emerald-100 text-emerald-700",
};

export const ACTION_PRIORITY = {
  DELETE:        { label: "Critique",  bg: "bg-red-50",    text: "text-red-700",    dot: "bg-red-500"    },
  LOGIN_ATTEMPT: { label: "Critique",  bg: "bg-red-50",    text: "text-red-700",    dot: "bg-red-500"    },
  RESTORE:       { label: "Haute",     bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-400" },
  UPDATE:        { label: "Normale",   bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-400"   },
  CREATE:        { label: "Normale",   bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-400"   },
  VALIDATE:      { label: "Normale",   bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-400"   },
  ANALYZE:       { label: "Normale",   bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-400"   },
  LOGIN:         { label: "Basse",     bg: "bg-slate-50",  text: "text-slate-500",  dot: "bg-slate-300"  },
  LOGOUT:        { label: "Basse",     bg: "bg-slate-50",  text: "text-slate-500",  dot: "bg-slate-300"  },
};

export const ENTITY_TYPES = ["USER", "CV", "COURS", "SESSION", "AFFECTATION", "COMPETENCE", "PONDERATION"];