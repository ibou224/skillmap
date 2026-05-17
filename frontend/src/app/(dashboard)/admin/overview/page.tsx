"use client";

import { useState } from "react";
import {
  Users, BookOpen, FileText, CheckCircle2,
  TrendingUp, Clock, Layers, Settings2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface StatCard {
  label: string;
  value: string | number;
  sub: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
}

interface BarData {
  label: string;
  value: number;
  max: number;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const stats: StatCard[] = [
  { label: "Professeurs",     value: 48,  sub: "+3 ce mois",       icon: <Users className="w-5 h-5" />,       color: "text-[hsl(134,35%,45%)]", bg: "bg-emerald-50" },
  { label: "Cours actifs",    value: 124, sub: "Session Automne",   icon: <BookOpen className="w-5 h-5" />,    color: "text-blue-500",            bg: "bg-blue-50"    },
  { label: "CVs uploadés",    value: 91,  sub: "dont 12 en attente",icon: <FileText className="w-5 h-5" />,   color: "text-amber-500",           bg: "bg-amber-50"   },
  { label: "Affectations",    value: 310, sub: "taux 94% couvert",  icon: <CheckCircle2 className="w-5 h-5" />,color: "text-violet-500",          bg: "bg-violet-50"  },
];

const affectationsBySession: BarData[] = [
  { label: "Hiver 2024",   value: 72,  max: 120 },
  { label: "Été 2024",     value: 45,  max: 120 },
  { label: "Automne 2024", value: 98,  max: 120 },
  { label: "Hiver 2025",   value: 110, max: 120 },
  { label: "Été 2025",     value: 60,  max: 120 },
  { label: "Automne 2025", value: 120, max: 120 },
];

const cvsByMonth: BarData[] = [
  { label: "Nov", value: 5,  max: 20 },
  { label: "Déc", value: 8,  max: 20 },
  { label: "Jan", value: 14, max: 20 },
  { label: "Fév", value: 11, max: 20 },
  { label: "Mar", value: 18, max: 20 },
  { label: "Avr", value: 20, max: 20 },
];

const recentActivity = [
  { who: "Marie Tremblay",  action: "CV uploadé et analysé",              time: "il y a 12 min", type: "cv"     },
  { who: "Système IA",      action: "Affectation automatique — INF-301",  time: "il y a 34 min", type: "ia"     },
  { who: "Jean Dupont",     action: "Profil mis à jour",                  time: "il y a 1h",     type: "user"   },
  { who: "Admin",           action: "Nouveau programme ajouté : DEC-TI",  time: "il y a 2h",     type: "admin"  },
  { who: "Système IA",      action: "Affectation automatique — MAT-201",  time: "il y a 3h",     type: "ia"     },
];

const typeColor: Record<string, string> = {
  cv:    "bg-amber-100 text-amber-700",
  ia:    "bg-violet-100 text-violet-700",
  user:  "bg-blue-100 text-blue-700",
  admin: "bg-emerald-100 text-emerald-700",
};
const typeLabel: Record<string, string> = { cv: "CV", ia: "IA", user: "User", admin: "Admin" };

// ─── Bar chart helpers ────────────────────────────────────────────────────────
function BarChart({ data, color }: { data: BarData[]; color: string }) {
  return (
    <div className="flex items-end gap-2 h-28 mt-4">
      {data.map((d) => {
        const pct = Math.round((d.value / d.max) * 100);
        return (
          <div key={d.label} className="flex flex-col items-center gap-1 flex-1">
            <span className="text-[10px] font-bold text-slate-400">{d.value}</span>
            <div className="w-full bg-slate-100 rounded-lg overflow-hidden flex-1 flex items-end" style={{ minHeight: 60 }}>
              <div
                className={`w-full rounded-lg transition-all ${color}`}
                style={{ height: `${pct}%` }}
              />
            </div>
            <span className="text-[9px] text-slate-400 text-center leading-tight">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Composant ────────────────────────────────────────────────────────────────
export default function OverviewSection() {
  const [period, setPeriod] = useState<"semaine" | "mois" | "session">("mois");

  return (
    <div className="space-y-6">

      {/* ── Banner ── */}
      <div className="relative overflow-hidden rounded-3xl p-8 shadow-lg bg-gradient-to-br from-[hsl(134,35%,45%)] to-[#135d55]">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />
        <h1 className="relative text-2xl sm:text-3xl font-black text-white">Vue d'ensemble</h1>
        <p className="relative text-white/70 text-sm mt-1">Tableau de bord administrateur — SkillMap</p>
        <div className="relative mt-4 flex gap-2">
          {(["semaine", "mois", "session"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all capitalize ${
                period === p ? "bg-white text-[hsl(134,35%,35%)]" : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s) => (
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

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Affectations par session */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-[hsl(134,35%,45%)]" />
            <h2 className="text-sm font-bold text-gray-700">Affectations par session</h2>
          </div>
          <p className="text-xs text-slate-400">Nombre de cours affectés automatiquement</p>
          <BarChart data={affectationsBySSession} color="bg-[hsl(134,35%,45%)]" />
        </div>

        {/* CVs uploadés par mois */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-bold text-gray-700">CVs uploadés / mois</h2>
          </div>
          <p className="text-xs text-slate-400">Nouveaux CVs analysés par l'IA</p>
          <BarChart data={cvsByMonth} color="bg-amber-400" />
        </div>
      </div>

      {/* ── Activité récente ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <h2 className="text-sm font-bold text-gray-700">Activité récente</h2>
        </div>
        <div className="divide-y divide-slate-50">
          {recentActivity.map((a, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg shrink-0 ${typeColor[a.type]}`}>
                {typeLabel[a.type]}
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

      {/* ── Raccourcis ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Gérer les utilisateurs", icon: <Users className="w-5 h-5" />,    color: "text-blue-500",   bg: "bg-blue-50"   },
          { label: "Voir les cours",          icon: <BookOpen className="w-5 h-5" />, color: "text-[hsl(134,35%,45%)]", bg: "bg-emerald-50" },
          { label: "Programmes",              icon: <Layers className="w-5 h-5" />,   color: "text-violet-500", bg: "bg-violet-50" },
          { label: "Paramètres IA",           icon: <Settings2 className="w-5 h-5" />,color: "text-slate-500",  bg: "bg-slate-100" },
        ].map((r) => (
          <button
            key={r.label}
            className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col items-center gap-2 hover:shadow-md hover:border-slate-200 transition-all text-center"
          >
            <div className={`w-10 h-10 rounded-xl ${r.bg} flex items-center justify-center ${r.color}`}>
              {r.icon}
            </div>
            <span className="text-xs font-semibold text-slate-600">{r.label}</span>
          </button>
        ))}
      </div>

    </div>
  );
}

// alias pour éviter l'erreur de variable
const affectationsBySSession = affectationsBySSession2();
function affectationsBySSession2(): BarData[] { return affectationsBySession; }