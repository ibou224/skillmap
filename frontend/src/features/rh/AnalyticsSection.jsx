"use client";

import { useEffect} from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { TrendingUp, Users, CheckCircle2, Star, RefreshCw, AlertCircle } from "lucide-react";
import { StatCard, CustomTooltip } from "@/components/rh/home/homeComponents";
import { useCvs } from "@/hooks/useProfessor";

const COLOR_PROPOSEE  = "#93c5fd";
const COLOR_AJUSTEE   = "#fcd34d";
const COLOR_FINALISEE = "#4ade80";
const COLOR_SCORE     = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#10b981"];


export default function AnalyticsSection() {
  const { fetchAnalytics, error,data,loading } = useCvs();

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
          <p className="text-sm text-slate-500">Chargement des données analytiques…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertCircle className="w-8 h-8 text-red-400" />
          <p className="text-sm font-medium text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const { sessionsStats, scoreDistribution, topProfessors, globalStats } = data;
  const pieData = sessionsStats.reduce(
    (acc, s) => {
      acc[0].value += s.proposee;
      acc[1].value += s.ajustee;
      acc[2].value += s.finalisee;
      return acc;
    },
    [
      { name: "Proposées",  value: 0, fill: COLOR_PROPOSEE  },
      { name: "Ajustées",   value: 0, fill: COLOR_AJUSTEE   },
      { name: "Finalisées", value: 0, fill: COLOR_FINALISEE },
    ]
  ).filter((d) => d.value > 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* ── En-tête ── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-5">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl">
              <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">Tableau de bord analytique</h1>
              <p className="text-xs text-slate-400">Historique des 8 dernières sessions d'affectations</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* ── Cartes stats globales ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={TrendingUp}   label="Sessions analysées"  value={globalStats.totalSessions}   color="bg-blue-500"    />
          <StatCard icon={CheckCircle2} label="Total affectations"  value={globalStats.totalAssignments} color="bg-slate-500"  />
          <StatCard icon={CheckCircle2} label="Taux de finalisation" value={`${globalStats.finalizedRate}%`} sub="parmi toutes les affectations" color="bg-emerald-500" />
          <StatCard icon={Star}         label="Score moyen"          value={`${globalStats.avgScore}%`}  sub="sur l'ensemble des propositions" color="bg-amber-500" />
        </div>

        {/* ── Affectations par session ── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Affectations par session</h2>
          <p className="text-[11px] text-slate-400 mb-5">Répartition par statut sur les dernières sessions</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={sessionsStats} barSize={18} barGap={4}
              margin={{ top: 4, right: 12, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="nom" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(148,163,184,0.07)" }} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
              <Bar dataKey="proposee"  name="Proposées"  fill={COLOR_PROPOSEE}  radius={[3, 3, 0, 0]} />
              <Bar dataKey="ajustee"   name="Ajustées"   fill={COLOR_AJUSTEE}   radius={[3, 3, 0, 0]} />
              <Bar dataKey="finalisee" name="Finalisées" fill={COLOR_FINALISEE} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ── Ligne inférieure ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Distribution des scores */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Distribution des scores</h2>
            <p className="text-[11px] text-slate-400 mb-5">Nombre de propositions par tranche</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={scoreDistribution} barSize={28}
                margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="range" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(148,163,184,0.07)" }} />
                <Bar dataKey="count" name="Propositions" radius={[4, 4, 0, 0]}>
                  {scoreDistribution.map((entry, i) => (
                    <Cell key={i} fill={COLOR_SCORE[i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Répartition statuts (Pie) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Répartition des statuts</h2>
            <p className="text-[11px] text-slate-400 mb-2">Toutes sessions confondues</p>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="45%" innerRadius={52} outerRadius={78} paddingAngle={3} dataKey="value">
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value} affectation(s)`, name]}
                    contentStyle={{ fontSize: 11, borderRadius: 10, border: "1px solid #e2e8f0" }}
                  />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-slate-400 text-sm">Aucune donnée disponible</div>
            )}
          </div>

          {/* Top professeurs */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-400" /> Top professeurs
            </h2>
            <p className="text-[11px] text-slate-400 mb-4">Affectations finalisées par enseignant</p>
            {topProfessors.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">Aucune affectation finalisée</p>
            ) : (
              <div className="space-y-2.5">
                {topProfessors.map((prof, i) => {
                  const max   = topProfessors[0].count;
                  const width = Math.round((prof.count / max) * 100);
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium text-slate-600 dark:text-slate-400 truncate max-w-[140px]">
                          {i === 0 && <span className="mr-1">🥇</span>}
                          {i === 1 && <span className="mr-1">🥈</span>}
                          {i === 2 && <span className="mr-1">🥉</span>}
                          {prof.nom}
                        </span>
                        <span className="font-bold tabular-nums text-slate-700 dark:text-slate-300 shrink-0 ml-2">{prof.count}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${width}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
