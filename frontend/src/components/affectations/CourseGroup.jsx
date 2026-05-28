"use client";

import { useState } from "react";
import {
  BookOpen, ChevronDown, ChevronUp, User, Edit3,
  Target, Briefcase, GraduationCap, Clock, BarChart2, AlertTriangle,
} from "lucide-react";
import { cn, scoreBarColor, scoreTextColor } from "@/lib/utils";
import { STATUT } from "@/constants/constantes";

// ── Badge statut ──────────────────────────────────────────────────────────────
function StatusBadge({ statut }) {
  const s = STATUT[statut] ?? STATUT.PROPOSEE;
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border", s.badge)}>
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", s.dot)} />
      {s.label}
    </span>
  );
}

// ── Barre de score ────────────────────────────────────────────────────────────
function ScoreBar({ score }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-20 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn("h-full rounded-full transition-all duration-300", scoreBarColor(score))}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={cn("text-sm font-semibold tabular-nums w-12", scoreTextColor(score))}>
        {score.toFixed(1)}%
      </span>
    </div>
  );
}

// ── Détail des 4 critères (dépliable par candidat) ────────────────────────────
function ScoreDetail({ detail, weights }) {
  const items = [
    { label: "Compétences", value: detail.skills,     icon: Target,        weight: weights.competences.weight },
    { label: "Expérience",  value: detail.experience, icon: Briefcase,     weight: weights.experience.weight  },
    { label: "Formation",   value: detail.education,  icon: GraduationCap, weight: weights.formation.weight   },
    { label: "Historique",  value: detail.history,    icon: Clock,         weight: weights.historique.weight  },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800">
      {items.map(({ label, value, icon: Icon, weight }) => (
        <div key={label} className="text-center p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-center gap-1.5 mb-1.5">
            <Icon className="w-3.5 h-3.5 text-slate-400" />
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
          </div>
          <p className={cn("text-xl font-bold tabular-nums", scoreTextColor(value))}>{value}%</p>
          <div className="mt-1.5 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className={cn("h-full rounded-full", scoreBarColor(value))} style={{ width: `${value}%` }} />
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Poids : {weight}%</p>
        </div>
      ))}
    </div>
  );
}

// ── Panneau de comparaison côte à côte ────────────────────────────────────────
const CRITERIA = [
  { key: "skills",     label: "Compétences", barColor: "bg-emerald-500", textColor: "text-emerald-600 dark:text-emerald-400", wKey: "competences" },
  { key: "experience", label: "Expérience",  barColor: "bg-blue-500",    textColor: "text-blue-600 dark:text-blue-400",       wKey: "experience"  },
  { key: "education",  label: "Formation",   barColor: "bg-purple-500",  textColor: "text-purple-600 dark:text-purple-400",   wKey: "formation"   },
  { key: "history",    label: "Historique",  barColor: "bg-amber-500",   textColor: "text-amber-600 dark:text-amber-400",     wKey: "historique"  },
];

function ComparePanel({ proposals, weights }) {
  return (
    <div className="border-t border-slate-100 dark:border-slate-800 px-5 py-4 bg-slate-50/70 dark:bg-slate-800/30">
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">
        Comparaison des candidats
      </p>

      <div className="overflow-x-auto -mx-1 px-1">
        <table className="w-full text-xs border-separate border-spacing-0">
          {/* En-têtes colonnes */}
          <thead>
            <tr>
              <th className="pb-2 pr-6 text-left font-semibold text-slate-500 min-w-[130px]">
                Professeur
              </th>
              {CRITERIA.map((c) => (
                <th key={c.key} className="pb-2 px-3 text-left min-w-[130px]">
                  <span className={cn("font-semibold", c.textColor)}>
                    {c.label}
                    <span className="ml-1 text-[9px] font-normal text-slate-400">
                      ({weights[c.wKey].weight}%)
                    </span>
                  </span>
                </th>
              ))}
              <th className="pb-2 pl-3 text-right font-semibold text-slate-500 min-w-[70px]">
                Total
              </th>
            </tr>
          </thead>

          {/* Lignes candidats */}
          <tbody>
            {proposals.map((p, i) => {
              const isTop = i === 0;
              return (
                <tr
                  key={p.id}
                  className={cn(
                    "rounded-lg",
                    isTop
                      ? "bg-emerald-50 dark:bg-emerald-900/15"
                      : "hover:bg-white dark:hover:bg-slate-900/40"
                  )}
                >
                  {/* Nom */}
                  <td className="py-2.5 pr-6">
                    <div className="flex items-center gap-1.5">
                      <p className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[110px]">
                        {p.professeur.prenom} {p.professeur.nom}
                      </p>
                      {isTop && (
                        <span className="shrink-0 text-[8px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-900/40 px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                          ★ Meilleur
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Mini-barres par critère */}
                  {CRITERIA.map((c) => {
                    const val = p.scoreDetail?.[c.key] ?? 0;
                    return (
                      <td key={c.key} className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden min-w-[70px]">
                            <div
                              className={cn("h-full rounded-full transition-all duration-300", c.barColor)}
                              style={{ width: `${val}%` }}
                            />
                          </div>
                          <span className={cn("tabular-nums w-8 text-right font-medium", scoreTextColor(val))}>
                            {val}%
                          </span>
                        </div>
                      </td>
                    );
                  })}

                  {/* Score final */}
                  <td className="py-2.5 pl-3 text-right">
                    <span className={cn("font-bold tabular-nums text-sm", scoreTextColor(p.score))}>
                      {p.score.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────
/**
 * Groupe d'affectations pour un cours donné.
 *
 * Props :
 *  - cours, proposals, onAction, weights            — données & callbacks
 *  - expandedProposalId, onToggleProposal           — état du détail dépliable
 *  - forceOpen                                      — forcé ouvert (ex: recherche active)
 *  - profCourseCount  Map<profId, nbCours>          — charge par prof dans la session
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
}) {
  const [open, setOpen]             = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const isOpen = forceOpen || open;

  const bestScore      = Math.max(...proposals.map((p) => p.score));
  const hasFinalized   = proposals.some((p) => p.statut === "FINALISEE");
  const countFinalized = proposals.filter((p) => p.statut === "FINALISEE").length;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">

      {/* ── En-tête du cours ── */}
      {/* div au lieu de button : le bouton "Comparer" est imbriqué ici,
          et HTML interdit les <button> dans un <button>. */}
      <div
        role="button"
        tabIndex={0}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors text-left cursor-pointer"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => e.key === "Enter" && setOpen((v) => !v)}
        aria-expanded={isOpen}
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

        {/* Droite : compteurs + meilleur score + bouton comparer + chevron */}
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
              onClick={(e) => { e.stopPropagation(); setShowCompare((v) => !v); }}
              className={cn(
                "hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold rounded-lg border transition-colors",
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

            // Charge du prof dans la session (nb de cours proposés/validés/finalisés)
            const profLoad = profCourseCount?.get(p.professeur.id) ?? 0;

            return (
              <div key={p.id}>
                {/* Ligne candidat */}
                <div
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                  onClick={() => onToggleProposal(p.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && onToggleProposal(p.id)}
                  aria-expanded={isDetailOpen}
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
                            title={`Ce professeur a ${profLoad} cours dans cette session`}
                          >
                            {profLoad} cours
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
