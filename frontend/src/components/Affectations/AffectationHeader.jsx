"use client";

import { Layers, Settings, Play, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils_Affectation";
import { PONDERATIONS_DEFAUT } from "@/lib/constants-Affectation";

import { useEffect } from "react";

export default function AffectationHeader({
  sessionId,
  programId,
  onSessionChange,
  onProgramChange,
  onRun,
  loading,
  hasRun,
  weights,
  onWeightChange,
  showWeights,
  onToggleWeights,
  sessions = [],
  programmes = [],
}) {
  const totalWeight  = Object.values(weights).reduce((s, w) => s + w.weight, 0);
  const weightsValid = totalWeight === 100;
  
  return (
    <header className="relative overflow-hidden bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-8 sm:px-8">
      {/* Décor lumineux */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-linear-to-br from-emerald-500/20 to-blue-500/20 blur-3xl" />

      <div className="relative flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        {/* Titre */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
              Responsable RH
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Affectations Intelligentes</h1>
          <p className="text-sm text-slate-400 mt-2 font-light max-w-xl">
            Générez des propositions d'affectation optimisées grâce à l'algorithme de pondération configurable.
          </p>
        </div>

        {/* Contrôles */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Session */}
          <select
            value={sessionId}
            onChange={(e) => onSessionChange(e.target.value)}
            className="px-3 py-2.5 text-sm bg-white/10 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40 backdrop-blur-sm"
            aria-label="Session"
          >
            <option value="" className="text-slate-800 bg-white">Choisissez une session .... </option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id} className="text-slate-800 bg-white">{s.nom}</option>
            ))}
          </select>

          {/* Programme */}
          <select
            value={programId}
            onChange={(e) => onProgramChange(e.target.value)}
            className="px-3 py-2.5 text-sm max-w-xs bg-white/10 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40 backdrop-blur-sm"
            aria-label="Programme"
          >
            <option value="" className="text-slate-800 bg-white">Choisissez un programme</option>
            {programmes.map((p) => (
              <option key={p.id} value={p.id} className="text-slate-800 bg-white">
                {p.nom}
              </option>
            ))}
          </select>

          {/* Toggle pondérations */}
          <button
            onClick={onToggleWeights}
            className={cn(
              "p-2.5 border rounded-xl transition",
              showWeights
                ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-400"
                : "bg-white/10 border-white/20 text-white/70 hover:text-white hover:bg-white/20"
            )}
            title="Configurer les pondérations"
            aria-label="Pondérations"
            aria-expanded={showWeights}
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Lancer */}
          <button
            onClick={onRun}
            disabled={!sessionId || !programId || loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white transition shadow-sm"
            aria-busy={loading}
          >
            {loading
              ? <RefreshCw className="w-4 h-4 animate-spin" />
              : hasRun
                ? <RefreshCw className="w-4 h-4" />
                : <Play className="w-4 h-4" />}
            {loading ? "Calcul…" : hasRun ? "Recalculer" : "Lancer l'algorithme"}
          </button>
        </div>
      </div>

      {/* Panneau pondérations (toggleable) */}
      {showWeights && (
        <div className="relative mt-5 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <Settings className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-white">Pondérations de l'algorithme</span>
            <span
              className={cn(
                "text-xs px-2 py-0.5 rounded-full",
                weightsValid
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-amber-500/20 text-amber-300"
              )}
            >
              Total : {totalWeight}% {weightsValid ? "✓" : "≠ 100"}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(weights).map(([key, cfg]) => {
              const Icon = cfg.icon;
              return (
                <div key={key}>
                  <label
                    htmlFor={`w-${key}`}
                    className="flex items-center gap-1.5 text-xs text-slate-300 mb-1.5"
                  >
                    <Icon className="w-3 h-3" />
                    {cfg.label}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id={`w-${key}`}
                      type="number"
                      min={PONDERATIONS_DEFAUT[key].min}
                      max={PONDERATIONS_DEFAUT[key].max}
                      value={cfg.weight}
                      onChange={(e) => onWeightChange(key, e.target.value)}
                      className="w-16 px-2 py-1.5 text-xs bg-white/10 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <span className="text-[11px] text-slate-500">
                      {PONDERATIONS_DEFAUT[key].min}–{PONDERATIONS_DEFAUT[key].max}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
