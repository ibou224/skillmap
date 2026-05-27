import { Users, BookOpen, CheckCircle2, CalendarRange } from "lucide-react";
import { createElement, useEffect, useMemo, useState } from "react";
import { useCourses } from "./useCourses";
import { useManagementUser } from "./useManagementUser";
import { useAffectations } from "./useAffectations";
import { useSessions } from "./useSessions";

const icon = (Icon) => createElement(Icon, { className: "w-5 h-5" });

const AFFECTATIONS_CHART = {
  title: "Affectations par session",
  subtitle: "Nombre de cours affectés automatiquement",
  color: "bg-emerald-500",
  data: [
    { label: "Hiver 2024",   value: 72,  max: 120 },
    { label: "Été 2024",     value: 45,  max: 120 },
    { label: "Automne 2024", value: 98,  max: 120 },
    { label: "Hiver 2025",   value: 110, max: 120 },
    { label: "Été 2025",     value: 60,  max: 120 },
    { label: "Automne 2025", value: 120, max: 120 },
  ],
};

const CVS_CHART = {
  title: "CVs uploadés / mois",
  subtitle: "Nouveaux CVs analysés par l'IA",
  color: "bg-amber-400",
  data: [
    { label: "Nov", value: 5,  max: 20 },
    { label: "Déc", value: 8,  max: 20 },
    { label: "Jan", value: 14, max: 20 },
    { label: "Fév", value: 11, max: 20 },
    { label: "Mar", value: 18, max: 20 },
    { label: "Avr", value: 20, max: 20 },
  ],
};

function relativeTime(iso) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)   return "il y a quelques secondes";
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`;
  return `il y a ${Math.floor(diff / 86400)}j`;
}

const ACTION_LABELS = {
  CREATE:   "Création",
  UPDATE:   "Modification",
  DELETE:   "Suppression",
  LOGIN:    "Connexion",
  LOGOUT:   "Déconnexion",
  RESTORE:  "Restauration",
  VALIDATE: "Validation",
  ANALYZE:  "Analyse IA",
};

function logToActivity(log) {
  const who    = log.user ? `${log.user.prenom} ${log.user.nom}` : "Système";
  const action = [ACTION_LABELS[log.action], log.entityType].filter(Boolean).join(" — ");
  const type   = log.action === "ANALYZE"       ? "ia"
               : log.entityType === "CV"        ? "cv"
               : log.user?.role === "ADMIN"     ? "admin"
               : "user";
  return { id: log.id, who, action, time: relativeTime(log.createdAt), type };
}

const TYPE_COLOR = {
  cv:    "bg-amber-100 text-amber-700",
  ia:    "bg-violet-100 text-violet-700",
  user:  "bg-blue-100 text-blue-700",
  admin: "bg-emerald-100 text-emerald-700",
};

const TYPE_LABEL = { cv: "CV", ia: "IA", user: "User", admin: "Admin" };

export function useHome() {
  const { courses, fetchCourses, isLoading: coursesLoading } = useCourses();
  const { users, getUsers, isLoading: usersLoading } = useManagementUser();
  const { proposals, fetchAffectations, loading: affectationsLoading } = useAffectations();
  const { sessions, fetchSessions, activateSession, isLoading: sessionsLoading } = useSessions();
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchCourses();
    getUsers();
    fetchAffectations();
    fetchSessions();
  }, [fetchCourses, getUsers, fetchAffectations, fetchSessions]);

  useEffect(() => {
    fetch("/api/admin/logs?limit=5")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setRecentActivity((json.data ?? []).map(logToActivity));
      });
  }, []);

  const professeursCount = useMemo(
    () => users.filter((u) => u.role === "PROFESSEUR").length,
    [users]
  );

  const coursActifsCount = useMemo(
    () => courses.filter((c) => !c.isArchived).length,
    [courses]
  );

  const coursArchivesCount = useMemo(
    () => courses.filter((c) => c.isArchived).length,
    [courses]
  );

  const sessionActive = useMemo(
    () => sessions.find((s) => s.statut === "ACTIVE"),
    [sessions]
  );

  const affectationsFinalisees = useMemo(
    () => proposals.filter((p) => p.statut === "FINALISEE").length,
    [proposals]
  );

  const STATS = [
    { label: "Professeurs",  value: professeursCount, sub: `${users.filter(u => u.role === "PROFESSEUR" && u.isActive).length} actifs`,   icon: icon(Users),         color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Cours actifs", value: coursActifsCount, sub: `${coursArchivesCount} archivé${coursArchivesCount > 1 ? "s" : ""}`,            icon: icon(BookOpen),      color: "text-blue-500",    bg: "bg-blue-50"    },
    { label: "Sessions",     value: sessions.length,  sub: sessionActive ? `"${sessionActive.nom}" active` : "Aucune session active",      icon: icon(CalendarRange), color: "text-indigo-500",  bg: "bg-indigo-50"  },
    { label: "Affectations", value: proposals.length, sub: `${affectationsFinalisees} finalisée${affectationsFinalisees > 1 ? "s" : ""}`,  icon: icon(CheckCircle2),  color: "text-violet-500",  bg: "bg-violet-50"  },
  ];

  return {
    STATS,
    AFFECTATIONS_CHART,
    CVS_CHART,
    RECENT_ACTIVITY: recentActivity,
    TYPE_COLOR,
    TYPE_LABEL,
    sessions,
    sessionActive,
    activateSession,
    fetchSessions,
    isLoading: coursesLoading || usersLoading || affectationsLoading || sessionsLoading,
  };
}
