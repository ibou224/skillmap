"use client";

/**
 * @module features/admin/HomeSection
 * @description Tableau de bord d'accueil administrateur : statistiques, graphiques
 * et activité récente, alimenté par {@link module:hooks/useHome}.
 * @returns {ReactNode} La section d'accueil admin.
 */

import { useState } from "react";
import {
  Users, BookOpen, FileText,
  TrendingUp, Clock, Layers, Settings2,
  CalendarRange, CheckCircle2, Play,
} from "lucide-react";
import Link from "next/link";
import { useHome } from "@/hooks/useHome";
import { BarChart } from "@/components/ui/BarChart";
import { AFFECTATIONS_CHART, CVS_CHART, relativeTime, logToActivity } from "@/constants/homeAdmin";
import AlertsPanel from "@/components/admin/AlertsPanel";

const SHORTCUT_ICONS = { Users, BookOpen, Layers, Settings2 };

const SHORTCUTS = [
  { label: "Utilisateurs", href: "/dashboard/admin/users",    icon: "Users",    color: "text-blue-500",    bg: "bg-blue-50"    },
  { label: "Cours",        href: "/dashboard/admin/courses",  icon: "BookOpen", color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Programmes",   href: "/dashboard/admin/programs", icon: "Layers",   color: "text-violet-500",  bg: "bg-violet-50"  },
  { label: "Paramètres",   href: "/dashboard/admin/settings", icon: "Settings2",color: "text-slate-500",   bg: "bg-slate-100"  },
];

const STATUT_STYLE = {
  ACTIVE:   "bg-emerald-50 text-emerald-700 border-emerald-200",
  ARCHIVEE: "bg-slate-50 text-slate-500 border-slate-200",
  PLANIFIEE:"bg-blue-50 text-blue-700 border-blue-200",
};


export default function HomeSection() {
  const {
    STATS, sessions, sessionActive, activateSession, fetchSessions,
    recentActivity, TYPE_COLOR, TYPE_LABEL,
  } = useHome();

  const [activating, setActivating] = useState(null);

  const handleActivate = async (session) => {
    setActivating(session.id);
    await activateSession(session.id);
    await fetchSessions();
    setActivating(null);
  };

  return (
    <div className="space-y-6">

      {/* Bannière */}
      <div className="relative overflow-hidden rounded-3xl p-8 shadow-lg bg-linear-to-br from-[hsl(134,35%,45%)] to-[#135d55]">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />
        <h1 className="relative text-2xl sm:text-3xl font-black text-white">Vue d&apos;ensemble</h1>
        <p className="relative text-white/70 text-sm mt-1">Tableau de bord administrateur — SkillMap</p>
      </div>

      {/* Alertes système — actions à entreprendre */}
      <AlertsPanel />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center ${s.color}`}>
              {s.icon}
            </div>
            <div>
              <p className="text-2xl font-black text-gray-800">{s.value}</p>
              <p className="text-xs font-semibold text-slate-500">{s.label}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Sessions */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <CalendarRange className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-bold text-gray-700">Sessions académiques</h2>
          </div>
          {sessionActive && (
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              Active : {sessionActive.nom}
            </span>
          )}
        </div>
        <div className="divide-y divide-slate-50">
          {sessions.length === 0 && (
            <p className="px-5 py-4 text-sm text-slate-400">Aucune session disponible.</p>
          )}
          {sessions.map((s) => {
            const isActive    = s.statut === "ACTIVE";
            const isActivating = activating === s.id;
            return (
              <div key={s.id} className={`flex items-center justify-between px-5 py-3 transition-colors ${isActive ? "bg-emerald-50/40" : ""}`}>
                <div className="flex items-center gap-3">
                  {isActive
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    : <div className="w-4 h-4 rounded-full border-2 border-slate-200 shrink-0" />
                  }
                  <div>
                    <p className="text-sm font-semibold text-gray-700">{s.nom}</p>
                    {(s.dateDebut || s.dateFin) && (
                      <p className="text-[11px] text-slate-400">
                        {s.dateDebut ? new Date(s.dateDebut).toLocaleDateString("fr-CA") : "—"}
                        {" → "}
                        {s.dateFin   ? new Date(s.dateFin).toLocaleDateString("fr-CA")   : "—"}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${STATUT_STYLE[s.statut] ?? "bg-slate-50 text-slate-500 border-slate-200"}`}>
                    {s.statut}
                  </span>
                  {!isActive && (
                    <button
                      onClick={() => handleActivate(s)}
                      disabled={!!activating}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[hsl(134,35%,45%)] rounded-lg hover:bg-[hsl(134,35%,35%)] transition disabled:opacity-50"
                    >
                      {isActivating
                        ? <span className="h-3 w-3 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                        : <Play className="w-3 h-3" />
                      }
                      Activer
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Activité récente */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <h2 className="text-sm font-bold text-gray-700">Activité récente</h2>
        </div>
        <div className="divide-y divide-slate-50">
          {recentActivity.length === 0 && (
            <p className="px-5 py-4 text-sm text-slate-400">Aucune activité récente.</p>
          )}
          {recentActivity.map((a) => (
            <div key={a.id} className="flex items-center gap-3 px-5 py-3">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg shrink-0 ${TYPE_COLOR[a.type]}`}>
                {TYPE_LABEL[a.type]}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-700 truncate">{a.who}</p>
                <p className="text-xs text-slate-400 truncate">{a.action}</p>
              </div>
              <span className="text-[10px] text-slate-400 shrink-0">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
