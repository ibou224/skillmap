import { Users, BookOpen, CheckCircle2, CalendarRange } from "lucide-react";
import {
  createElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useCourses } from "./useCourses";
import { useManagementUser } from "./useManagementUser";
import { useAffectations } from "./useAffectations";
import { useSessions } from "./useSessions";
import { AFFECTATIONS_CHART, CVS_CHART, logToActivity, TYPE_COLOR, TYPE_LABEL } from "@/constants/homeAdmin";

const icon = (Icon) => createElement(Icon, { className: "w-5 h-5" });

export function useHome() {
  const { courses, fetchCourses, isLoading: coursesLoading } = useCourses();
  const { users, getUsers, isLoading: usersLoading } = useManagementUser();
  const {
    proposals,
    fetchAffectations,
    loading: affectationsLoading,
  } = useAffectations();
  const {
    sessions,
    fetchSessions,
    activateSession,
    isLoading: sessionsLoading,
  } = useSessions();
  const [recentActivity, setRecentActivity] = useState([]);

  const fetchRecentActivity = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/logs?limit=5");
      if (!response.ok) throw new Error(`Erreur ${response.status}`);
      const dataActivity = await response.json();
      setRecentActivity((dataActivity.data ?? []).slice(0, 5).map(logToActivity));
    } catch (err) {
      console.error("fetchRecentActivity:", err);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
    getUsers();
    fetchAffectations();
    fetchSessions();
  }, [fetchCourses, getUsers, fetchAffectations, fetchSessions]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchRecentActivity(); }, [fetchRecentActivity]);

  const professeursCount = useMemo(
    () => users.filter((u) => u.role === "PROFESSEUR").length,
    [users],
  );

  const coursActifsCount = useMemo(
    () => courses.filter((c) => !c.isArchived).length,
    [courses],
  );

  const coursArchivesCount = useMemo(
    () => courses.filter((c) => c.isArchived).length,
    [courses],
  );

  const sessionActive = useMemo(
    () => sessions.find((s) => s.statut === "ACTIVE"),
    [sessions],
  );

  const affectationsFinalisees = useMemo(
    () => proposals.filter((p) => p.statut === "FINALISEE").length,
    [proposals],
  );

  const STATS = [
    {
      label: "Professeurs",
      value: professeursCount,
      sub: `${users.filter((u) => u.role === "PROFESSEUR" && u.isActive).length} actifs`,
      icon: icon(Users),
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Cours actifs",
      value: coursActifsCount,
      sub: `${coursArchivesCount} archivé${coursArchivesCount > 1 ? "s" : ""}`,
      icon: icon(BookOpen),
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      label: "Sessions",
      value: sessions.length,
      sub: sessionActive
        ? `"${sessionActive.nom}" active`
        : "Aucune session active",
      icon: icon(CalendarRange),
      color: "text-indigo-500",
      bg: "bg-indigo-50",
    },
    {
      label: "Affectations",
      value: proposals.length,
      sub: `${affectationsFinalisees} finalisée${affectationsFinalisees > 1 ? "s" : ""}`,
      icon: icon(CheckCircle2),
      color: "text-violet-500",
      bg: "bg-violet-50",
    },
  ];

  return {
    STATS,
    AFFECTATIONS_CHART,
    CVS_CHART,
    recentActivity,
    TYPE_COLOR,
    TYPE_LABEL,
    sessions,
    sessionActive,
    activateSession,
    fetchSessions,
    fetchRecentActivity,
    isLoading:
      coursesLoading || usersLoading || affectationsLoading || sessionsLoading,
  };
}
