"use client";

/**
 * @module components/affectations/AffectationHeader
 * @description En-tête de la page d'affectations : sélection session/programme,
 * panneau de pondérations (modifiable) et filtres de volume (topN, score min),
 * bouton de lancement de l'algorithme.
 */

import { Layers, Settings, Play, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { PONDERATIONS_DEFAUT } from "@/constants/affectations";

import { useEffect } from "react";

/**
 * En-tête de configuration et de lancement de l'analyse d'affectations.
 *
 * @param {Object} props
 * @param {string} props.sessionId - Session sélectionnée.
 * @param {string} props.programId - Programme sélectionné.
 * @param {Function} props.onSessionChange - Callback de changement de session.
 * @param {Function} props.onProgramChange - Callback de changement de programme.
 * @param {Function} props.onRun - Lance l'algorithme.
 * @param {boolean} props.loading - Analyse en cours.
 * @param {boolean} props.hasRun - Indique qu'une analyse a déjà été lancée.
 * @param {Object} props.weights - Pondérations courantes par critère.
 * @param {Function} props.onWeightChange - Callback de changement d'une pondération.
 * @param {boolean} props.showWeights - Affiche le panneau de pondérations.
 * @param {Function} props.onToggleWeights - Bascule l'affichage des pondérations.
 * @param {Array<Object>} [props.sessions] - Liste des sessions disponibles.
 * @param {Array<Object>} [props.programmes] - Liste des programmes disponibles.
 * @param {number} [props.topN=5] - Nombre max de profs proposés par cours.
 * @param {Function} props.onTopNChange - Callback de changement de topN.
 * @param {number} [props.minScore=0] - Score minimal des propositions.
 * @param {Function} props.onMinScoreChange - Callback de changement du score min.
 * @returns {JSX.Element} L'en-tête d'affectations.
 */
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
  topN = 5,
  onTopNChange,
  minScore = 0,
  onMinScoreChange,
}) {
  const totalWeight  = Object.values(weights).reduce((s, w) => s + w.weight, 0);
  const weightsValid = totalWeight === 100;
  
  return (
    <header className="relative overflow-hidden bg-linear-to-br from-[hsl(134,35%,45%)] to-[#135d55] px-6 py-8 sm:px-8">
      {/* Décor lumineux */}
      <div className="pointer-events-none absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10" />

      <div className="relative flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        {/* Titre */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-white/70" />
            <span className="text-xs font-bold uppercase tracking-widest text-white/70">
              Gestion académique
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Affectations des enseignants</h1>
          <p className="text-sm text-white/70 mt-2 font-light max-w-xl">
            Générez et pilotez les propositions d&apos;affectation des enseignants aux cours selon les critères de pondération configurés.
          </p>
        </div>

        {/* Contrôles */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Session */}
          <select
            value={sessionId}
            onChange={(e) => onSessionChange(e.target.value)}
            className="px-3 py-2.5 text-sm bg-white/10 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-white/40 backdrop-blur-sm"
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
            className="px-3 py-2.5 text-sm max-w-xs bg-white/10 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-white/40 backdrop-blur-sm"
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
                ? "bg-white/20 border-white/40 text-white"
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
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl bg-white text-[hsl(134,35%,45%)] hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
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
            <Settings className="w-4 h-4 text-white/70" />
            <span className="text-sm font-medium text-white">Pondérations de l&apos;algorithme</span>
            <span
              className={cn(
                "text-xs px-2 py-0.5 rounded-full",
                weightsValid
                  ? "bg-white/20 text-white/90"
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
                    className="flex items-center gap-1.5 text-xs text-white/70 mb-1.5"
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
                      className="w-16 px-2 py-1.5 text-xs bg-white/10 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-white/50"
                    />
                    <span className="text-[11px] text-white/50">
                      {PONDERATIONS_DEFAUT[key].min}–{PONDERATIONS_DEFAUT[key].max}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Séparateur + filtres de volume */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-xs font-medium text-white/70 mb-3">Filtres de volume des propositions</p>
            <div className="flex flex-wrap gap-6">

              {/* Top N */}
              <div>
                <label htmlFor="filter-topn" className="block text-xs text-white/70 mb-1.5">
                  Meilleurs profs par cours
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="filter-topn"
                    type="number"
                    min={1}
                    max={20}
                    step={1}
                    value={topN}
                    onChange={(e) => onTopNChange?.(Math.min(20, Math.max(1, Number(e.target.value))))}
                    className="w-16 px-2 py-1.5 text-xs bg-white/10 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-white/50"
                  />
                  <span className="text-[11px] text-white/50">top (1–20)</span>
                </div>
              </div>

              {/* Score minimum */}
              <div>
                <label htmlFor="filter-minscore" className="block text-xs text-white/70 mb-1.5">
                  Score minimum
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="filter-minscore"
                    type="number"
                    min={0}
                    max={95}
                    step={5}
                    value={minScore}
                    onChange={(e) => onMinScoreChange?.(Math.min(95, Math.max(0, Number(e.target.value))))}
                    className="w-16 px-2 py-1.5 text-xs bg-white/10 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-white/50"
                  />
                  <span className="text-[11px] text-white/50">% (0–95)</span>
                </div>
              </div>

              {/* Aperçu */}
              <div className="flex items-end pb-0.5">
                <p className="text-[11px] text-white/40 italic">
                  Max ≈ top {topN} par cours · éliminer &lt; {minScore}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
