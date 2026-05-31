"use client";

import { useState } from "react";
import {
  BookOpen, ChevronDown, ChevronUp, User, Edit3,
  BarChart2, AlertTriangle, XCircle,
} from "lucide-react";
import { cn, scoreTextColor } from "@/lib/utils";
import { StatusBadge, ScoreBar, ScoreDetail, ComparePanel } from "@/components/affectations/AffectationModal";

// ── Composant principal ───────────────────────────────────────────────────────
/**
 * @module components/affectations/CourseGroup
 * @description Regroupe et affiche les candidats (propositions) d'un cours donné,
 * avec dépliage, comparaison côte à côte et actions par candidat.
 */

/**
 * Groupe d'affectations pour un cours donné.
 *
 * @param {Object} props
 * @param {Object} props.cours - Cours concerné (id, code, nom, etape).
 * @param {Array<Object>} props.proposals - Candidats proposés pour ce cours.
 * @param {Function} props.onAction - Callback d'action (adjust/validate/finalize/cancel, id).
 * @param {Object} props.weights - Pondérations des critères (pour le détail des scores).
 * @param {string|null} props.expandedProposalId - Id de la proposition au détail ouvert.
 * @param {Function} props.onToggleProposal - Ouvre/ferme le détail d'une proposition.
 * @param {boolean} [props.forceOpen=false] - Force l'ouverture du groupe (ex. recherche active).
 * @param {Map<string, number>} props.profCourseCount - Charge (nb cours finalisés) par professeur.
 * @param {string} props.role - Rôle de l'utilisateur (conditionne certaines actions).
 * @returns {JSX.Element} Le groupe de cours.
 */
export default function CourseGroup({
  cours,
  proposals,
  onAction,
  weights,
  expandedProposalId,
  onToggleProposal,
  forceOpen    = false,
  profCourseCount,
  role,
}) {
  const [open, setOpen]             = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const isOpen = forceOpen || open;

  const bestScore      = Math.max(...proposals.map((p) => p.score));
  const hasFinalized   = proposals.some((p) => p.statut === "FINALISEE");
  const countFinalized = proposals.filter((p) => p.statut === "FINALISEE").length;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors text-left cursor-pointer"
        onClick={() => setOpen((v) => !v)}
      >
        {/* Gauche : icône + infos cours */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0">
            <BookOpen className="w-5 h-5 text-slate-500" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{cours.nom}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{cours.code} · Étape {cours.etape}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-4">
          <div className="text-right hidden sm:block">
            <p className="text-[11px] text-slate-400 tabular-nums">
              {proposals.length} candidat{proposals.length > 1 ? "s" : ""}
            </p>
            <p className={cn("text-xs font-semibold tabular-nums", scoreTextColor(bestScore))}>
              Meilleur : {bestScore.toFixed(1)}%
            </p>
          </div>

          {hasFinalized && (
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
              {countFinalized} finalisé{countFinalized > 1 ? "s" : ""}
            </span>
          )}

          {/* Bouton comparer — visible seulement si ≥ 2 candidats */}
          {proposals.length >= 2 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setShowCompare((v) => !v); setOpen(true); }}
              className={cn(
                "hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-[10px] cursor-pointer font-semibold rounded-lg border transition-colors",
                showCompare
                  ? "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600"
                  : "bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-slate-300 hover:text-slate-700"
              )}
              aria-pressed={showCompare}
            >
              <BarChart2 className="w-3 h-3" />
              Comparer
            </button>
          )}

          {isOpen
            ? <ChevronUp  className="w-4 h-4 text-slate-400" />
            : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </div>

      {/* ── Panneau de comparaison ── */}
      {isOpen && showCompare && proposals.length >= 2 && (
        <ComparePanel proposals={proposals} weights={weights} />
      )}

      {/* ── Liste des candidats ── */}
      {isOpen && (
        <div className="border-t border-slate-100 dark:border-slate-800 divide-y divide-slate-50 dark:divide-slate-800/60">
          {proposals.map((p) => {
            const isFinal      = p.statut === "FINALISEE";
            const isDetailOpen = expandedProposalId === p.id;
            const isAjustee    = p.statut === "AJUSTEE";

            const profLoad = profCourseCount?.get(p.professeur.id) ?? 0;

            return (
              <div key={p.id}>
                {/* Ligne candidat */}
                <div
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                  onClick={() => onToggleProposal(p.id)}
                >
                  {/* Avatar + identité + charge */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                          {p.professeur.prenom} {p.professeur.nom}
                        </p>
                        {/* ── #20 : Badge charge professeur ── */}
                        {profLoad > 1 && (
                          <span
                            className={cn(
                              "shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded-full border",
                              profLoad >= 4
                                ? "text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
                                : "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800"
                            )}
                            title={`Ce professeur a ${profLoad} cours finalisé${profLoad > 1 ? "s" : ""} dans cette session`}
                          >
                            {profLoad} finalisé{profLoad > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{p.professeur.email}</p>
                    </div>
                  </div>

                  {/* Score + indicateur "estimé" si cours ajusté manuellement */}
                  <div className="shrink-0 flex flex-col items-end gap-0.5">
                    <ScoreBar score={p.score} />
                    {/* ── #19 : Badge score estimé ── */}
                    {isAjustee && (
                      <span
                        className="inline-flex items-center gap-0.5 text-[9px] font-medium text-amber-600 dark:text-amber-400"
                        title="Cours modifié manuellement — le score a été calculé sur le cours d'origine"
                      >
                        <AlertTriangle className="w-2.5 h-2.5" />
                        score estimé
                      </span>
                    )}
                  </div>

                  {/* Statut */}
                  <div className="shrink-0 hidden md:block">
                    <StatusBadge statut={p.statut} />
                  </div>

                  {/* Actions */}
                  <div
                    className="flex items-center gap-1.5 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {!isFinal && (
                      <button
                        onClick={() => onAction("adjust", p.id)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                        title="Ajuster le cours"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                    {p.statut === "PROPOSEE" && (
                      <button
                        onClick={() => onAction("validate", p.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition"
                      >
                        Valider
                      </button>
                    )}
                    {p.statut === "AJUSTEE" && (
                      <button
                        onClick={() => onAction("finalize", p.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
                      >
                        Finaliser
                      </button>
                    )}
                    {p.statut === "FINALISEE" && role === "ADMIN" && (
                      <button
                        onClick={() => onAction("cancel", p.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition"
                        title="Annuler l'affectation finalisée"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Annuler
                      </button>
                    )}

                    {/* Chevron détail score */}
                    <span className="text-slate-300 dark:text-slate-600 ml-0.5">
                      {isDetailOpen
                        ? <ChevronUp   className="w-4 h-4" />
                        : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </div>
                </div>

                {/* Panneau de détail des 4 critères */}
                {isDetailOpen && (
                  <ScoreDetail detail={p.scoreDetail} weights={weights} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
