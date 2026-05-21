"use client";

import { useCallback } from "react";
import {
  BookOpen, User, ChevronDown, ChevronUp, Edit3,
  Target, Briefcase, GraduationCap, Clock,
} from "lucide-react";
import { cn, scoreBarColor, scoreTextColor } from "@/lib/utils_Affectation";
import { STATUT } from "@/lib/constants-Affectation";

// ── Atome : badge de statut ───────────────────────────────────────────────────
function StatusBadge({ statut }) {
  const s = STATUT[statut] ?? STATUT.PROPOSEE;
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border", s.badge)}>
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", s.dot)} />
      {s.label}
    </span>
  );
}

// ── Atome : barre de score ────────────────────────────────────────────────────
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
      <span className={cn("text-sm font-semibold tabular-nums", scoreTextColor(score))}>
        {score.toFixed(1)}%
      </span>
    </div>
  );
}

// ── Panneau détail des 4 critères ────────────────────────────────────────────
function ScoreDetail({ detail, weights }) {
  const items = [
    { label: "Compétences", value: detail.skills,     icon: Target,        weight: weights.competences.weight },
    { label: "Expérience",  value: detail.experience, icon: Briefcase,     weight: weights.experience.weight  },
    { label: "Formation",   value: detail.education,  icon: GraduationCap, weight: weights.formation.weight   },
    { label: "Historique",  value: detail.history,    icon: Clock,         weight: weights.historique.weight  },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-5 py-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800">
      {items.map(({ label, value, icon: Icon, weight }) => (
        <div
          key={label}
          className="text-center p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700"
        >
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

// ── Composant principal ───────────────────────────────────────────────────────
/**
 * Une ligne du tableau d'affectation, avec panneau de détail dépliable.
 * @param {{ proposal, onAction, isExpanded, onToggle, weights }} props
 */
export default function ProposalRow({ proposal, onAction, isExpanded, onToggle, weights }) {
  const stopAndCall = useCallback(
    (e, action) => { e.stopPropagation(); onAction(action, proposal.id); },
    [onAction, proposal.id]
  );

  const isFinal = proposal.statut === "FINALISEE";

  return (
    <>
      <tr
        className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
        onClick={onToggle}
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onToggle()}
        aria-expanded={isExpanded}
      >
        {/* Cours */}
        <td className="px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0">
              <BookOpen className="w-4 h-4 text-slate-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{proposal.cours.nom}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {proposal.cours.code} · Étape {proposal.cours.etape}
              </p>
            </div>
          </div>
        </td>

        {/* Professeur */}
        <td className="px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0">
              <User className="w-4 h-4 text-slate-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {proposal.professeur.prenom} {proposal.professeur.nom}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">{proposal.professeur.email}</p>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {proposal.professeur.competences.slice(0, 2).map((c, i) => (
                  <span
                    key={i}
                    className="px-1.5 py-0.5 text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded"
                  >
                    {c}
                  </span>
                ))}
                {proposal.professeur.competences.length > 2 && (
                  <span className="text-[10px] text-slate-400 self-center">
                    +{proposal.professeur.competences.length - 2}
                  </span>
                )}
              </div>
            </div>
          </div>
        </td>

        {/* Score */}
        <td className="px-5 py-4">
          <ScoreBar score={proposal.score} />
        </td>

        {/* Statut */}
        <td className="px-5 py-4">
          <StatusBadge statut={proposal.statut} />
        </td>

        {/* Actions */}
        <td className="px-5 py-4">
          <div
            className="flex items-center justify-end gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            {!isFinal && (
              <button
                onClick={(e) => stopAndCall(e, "adjust")}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                title="Ajuster"
                aria-label={`Ajuster l'affectation de ${proposal.professeur.nom}`}
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
            {proposal.statut === "PROPOSEE" && (
              <button
                onClick={(e) => stopAndCall(e, "validate")}
                className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition"
              >
                Valider
              </button>
            )}
            {proposal.statut === "AJUSTEE" && (
              <button
                onClick={(e) => stopAndCall(e, "finalize")}
                className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
              >
                Finaliser
              </button>
            )}
            <span className="text-slate-300 dark:text-slate-700 ml-1">
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </span>
          </div>
        </td>
      </tr>

      {/* Panneau détail dépliable */}
      {isExpanded && (
        <tr>
          <td colSpan={5} className="p-0">
            <ScoreDetail detail={proposal.scoreDetail} weights={weights} />
          </td>
        </tr>
      )}
    </>
  );
}
