/**
 * @module components/affectations/AffectationModal
 * @description Briques d'affichage réutilisables des affectations : badge de statut,
 * barre de score, détail des 4 critères et panneau de comparaison des candidats.
 */

import { Target, Briefcase, GraduationCap, Clock } from "lucide-react";
import { cn, scoreBarColor, scoreTextColor } from "@/lib/utils";
import { STATUT } from "@/constants/constantes";


/**
 * Badge de statut coloré avec pastille.
 * @param {Object} props
 * @param {string} props.statut - Clé de statut (ex. PROPOSEE).
 * @returns {JSX.Element} Le badge.
 */
export function StatusBadge({ statut }) {
  const s = STATUT[statut] ?? STATUT.PROPOSEE;
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border", s.badge)}>
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", s.dot)} />
      {s.label}
    </span>
  );
}

// ── Barre de score ────────────────────────────────────────────────────────────
/**
 * Barre de score avec valeur numérique.
 * @param {Object} props
 * @param {number} props.score - Score sur 100.
 * @returns {JSX.Element} La barre de score.
 */
export function ScoreBar({ score }) {
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
/**
 * Détail des 4 sous-scores (compétences, expérience, formation, historique).
 * @param {Object} props
 * @param {Object} props.detail - Sous-scores { skills, experience, education, history }.
 * @param {Object} props.weights - Pondérations par critère.
 * @returns {JSX.Element} Le panneau de détail.
 */
export function ScoreDetail({ detail, weights }) {
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
/** Définition des 4 critères (clé, libellé, couleurs, clé de pondération). */
export const CRITERIA = [
  { key: "skills",     label: "Compétences", barColor: "bg-emerald-500", textColor: "text-emerald-600 dark:text-emerald-400", wKey: "competences" },
  { key: "experience", label: "Expérience",  barColor: "bg-blue-500",    textColor: "text-blue-600 dark:text-blue-400",       wKey: "experience"  },
  { key: "education",  label: "Formation",   barColor: "bg-purple-500",  textColor: "text-purple-600 dark:text-purple-400",   wKey: "formation"   },
  { key: "history",    label: "Historique",  barColor: "bg-amber-500",   textColor: "text-amber-600 dark:text-amber-400",     wKey: "historique"  },
];

/**
 * Tableau de comparaison côte à côte de plusieurs candidats sur les 4 critères.
 * @param {Object} props
 * @param {Array<Object>} props.proposals - Candidats à comparer (triés, le 1er = meilleur).
 * @param {Object} props.weights - Pondérations par critère.
 * @returns {JSX.Element} Le panneau de comparaison.
 */
export function ComparePanel({ proposals, weights }) {
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