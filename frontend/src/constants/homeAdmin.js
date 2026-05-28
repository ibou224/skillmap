import { createElement} from "react";


const icon = (Icon) => createElement(Icon, { className: "w-5 h-5" });

export const AFFECTATIONS_CHART = {
  title: "Affectations par session",
  subtitle: "Nombre de cours affectés automatiquement",
  color: "bg-emerald-500",
  data: [
    { label: "Hiver 2024", value: 72, max: 120 },
    { label: "Été 2024", value: 45, max: 120 },
    { label: "Automne 2024", value: 98, max: 120 },
    { label: "Hiver 2025", value: 110, max: 120 },
    { label: "Été 2025", value: 60, max: 120 },
    { label: "Automne 2025", value: 120, max: 120 },
  ],
};

export const CVS_CHART = {
  title: "CVs uploadés / mois",
  subtitle: "Nouveaux CVs analysés par l'IA",
  color: "bg-amber-400",
  data: [
    { label: "Nov", value: 5, max: 20 },
    { label: "Déc", value: 8, max: 20 },
    { label: "Jan", value: 14, max: 20 },
    { label: "Fév", value: 11, max: 20 },
    { label: "Mar", value: 18, max: 20 },
    { label: "Avr", value: 20, max: 20 },
  ],
};

export function relativeTime(iso) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "il y a quelques secondes";
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`;
  return `il y a ${Math.floor(diff / 86400)}j`;
}

const ACTION_LABELS = {
  CREATE: "Création",
  UPDATE: "Modification",
  DELETE: "Suppression",
  LOGIN: "Connexion",
  LOGOUT: "Déconnexion",
  RESTORE: "Restauration",
  VALIDATE: "Validation",
  ANALYZE: "Analyse IA",
};

export function logToActivity(log) {
  const who = log.user ? `${log.user.prenom} ${log.user.nom}` : "Système";
  const action = [ACTION_LABELS[log.action], log.entityType]
    .filter(Boolean)
    .join(" — ");
  const type =
    log.action === "ANALYZE"
      ? "ia"
      : log.entityType === "CV"
        ? "cv"
        : log.user?.role === "ADMIN"
          ? "admin"
          : "user";
  return { id: log.id, who, action, time: relativeTime(log.createdAt), type };
}

export const TYPE_COLOR = {
  cv: "bg-amber-100 text-amber-700",
  ia: "bg-violet-100 text-violet-700",
  user: "bg-blue-100 text-blue-700",
  admin: "bg-emerald-100 text-emerald-700",
};

export const TYPE_LABEL = { cv: "CV", ia: "IA", user: "User", admin: "Admin" };

