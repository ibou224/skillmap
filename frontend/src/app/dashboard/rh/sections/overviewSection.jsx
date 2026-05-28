"use client";

import { BookOpen, CheckCircle, Clock, TrendingUp } from "lucide-react";

const stats = [
  { icon: BookOpen,    label: "Cours affectés",  value: "4",   sub: "Session Automne 2026", color: "text-emerald-600", bg: "bg-emerald-50" },
  { icon: CheckCircle, label: "Finalisés",       value: "2",   sub: "50% complétés",        color: "text-blue-600",    bg: "bg-blue-50"    },
  { icon: Clock,       label: "En attente",      value: "1",   sub: "À soumettre",           color: "text-amber-600",   bg: "bg-amber-50"   },
  { icon: TrendingUp,  label: "Score moyen",     value: "85%", sub: "Tous cours confondus", color: "text-violet-600",  bg: "bg-violet-50"  },
];

const recent = [
  { code: "420-1A3", nom: "Programmation Web", statut: "FINALISEE", score: 92 },
  { code: "420-3C5", nom: "IA Appliquée",      statut: "AJUSTEE",   score: 84 },
  { code: "420-1D6", nom: "Algorithmique",     statut: "PROPOSEE",  score: 78 },
];

const STATUT_COLOR = {
  FINALISEE: "bg-emerald-50 text-emerald-600",
  AJUSTEE:   "bg-blue-50 text-blue-600",
  PROPOSEE:  "bg-amber-50 text-amber-600",
};

const STATUT_LABEL = {
  FINALISEE: "Finalisée", AJUSTEE: "Ajustée", PROPOSEE: "Proposée",
};

export default function OverviewSection() {
  return (
    <div className="space-y-6">

      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl p-8 shadow-lg bg-gradient-to-br from-[hsl(134,35%,45%)] to-[#135d55]">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
        <div className="relative">
          <h1 className="text-2xl sm:text-3xl font-black text-white">Vue d'ensemble</h1>
          <p className="text-white/70 text-sm mt-1">Session active : Automne 2026</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ icon: Icon, label, value, sub, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-800">{value}</p>
              <p className="text-xs font-semibold text-gray-600 mt-0.5">{label}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Activité récente */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-50">
          <h2 className="text-sm font-black text-gray-700 uppercase tracking-widest">Activité récente</h2>
        </div>
        <div className="divide-y divide-slate-50">
          {recent.map((r) => (
            <div key={r.code} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
              <div>
                <p className="text-sm font-semibold text-gray-800">{r.nom}</p>
                <p className="text-xs font-mono text-slate-400 mt-0.5">{r.code}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-black text-emerald-600 text-sm">{r.score}%</span>
                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${STATUT_COLOR[r.statut]}`}>
                  {STATUT_LABEL[r.statut]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}