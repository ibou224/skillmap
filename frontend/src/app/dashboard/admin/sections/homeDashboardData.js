import { Users, BookOpen, FileText, CheckCircle2 } from "lucide-react";
import { createElement } from "react";

const icon = (Icon) => createElement(Icon, { className: "w-5 h-5" });

export const STATS = [
  { label: "Professeurs", value: 48, sub: "+3 ce mois", icon: icon(Users), color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Cours actifs", value: 124, sub: "Session Automne", icon: icon(BookOpen), color: "text-blue-500", bg: "bg-blue-50" },
  { label: "CVs uploadés", value: 91, sub: "dont 12 en attente", icon: icon(FileText), color: "text-amber-500", bg: "bg-amber-50" },
  { label: "Affectations", value: 310, sub: "taux 94% couvert", icon: icon(CheckCircle2), color: "text-violet-500", bg: "bg-violet-50" },
];

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

export const RECENT_ACTIVITY = [
  { id: "act-1", who: "Marie Tremblay", action: "CV uploadé et analysé", time: "il y a 12 min", type: "cv" },
  { id: "act-2", who: "Système IA", action: "Affectation automatique — INF-301", time: "il y a 34 min", type: "ia" },
  { id: "act-3", who: "Jean Dupont", action: "Profil mis à jour", time: "il y a 1h", type: "user" },
  { id: "act-4", who: "Admin", action: "Nouveau programme ajouté : DEC-TI", time: "il y a 2h", type: "admin" },
  { id: "act-5", who: "Système IA", action: "Affectation automatique — MAT-201", time: "il y a 3h", type: "ia" },
];

export const TYPE_COLOR = {
  cv: "bg-amber-100 text-amber-700",
  ia: "bg-violet-100 text-violet-700",
  user: "bg-blue-100 text-blue-700",
  admin: "bg-emerald-100 text-emerald-700",
};

export const TYPE_LABEL = { cv: "CV", ia: "IA", user: "User", admin: "Admin" };
