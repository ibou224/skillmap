/**
 * @module constants/header
 * @description Constantes d'en-tête de dashboard : couleurs et libellés par rôle,
 * et liens vers la page de paramètres selon le rôle.
 */

export const ROLE_COLORS = {
  PROFESSEUR: "bg-blue-50 text-blue-700 border-blue-200",
  RH:         "bg-emerald-50 text-emerald-700 border-emerald-200",
  ADMIN:      "bg-amber-50 text-amber-700 border-amber-200",
};

export const ROLE_LABELS = {
  PROFESSEUR: "Professeur",
  RH:         "Responsable RH",
  ADMIN:      "Administrateur",
};

export const SETTINGS_HREF = {
  PROFESSEUR: "/dashboard/professeur/settings",
  RH:         "/dashboard/rh/settings",
  ADMIN:      "/dashboard/admin/settings",
};

export function getInitials(prenom, nom) {
  return ((prenom?.[0] ?? "") + (nom?.[0] ?? "")).toUpperCase() || "?";
}

export function formatToday() {
  return new Intl.DateTimeFormat("fr-CA", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
}

