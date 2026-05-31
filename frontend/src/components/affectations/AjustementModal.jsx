"use client";

import { useEffect, useState } from "react";
import { X, Check } from "lucide-react";
import { cn, scoreBarColor, scoreTextColor } from "@/lib/utils";

/**
 * @module components/affectations/AjustementModal
 * @description Modale d'ajustement manuel d'une affectation : changement du cours
 * assigné et ajout d'une note d'audit.
 */

// ── Mini barre de score (réutilisée dans le modal) ────────────────────────────
/**
 * Barre de score (atome interne au modal).
 * @param {Object} props
 * @param {number} props.score - Score sur 100.
 * @returns {JSX.Element} La barre de score.
 */
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
          className={cn("h-full rounded-full", scoreBarColor(score))}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={cn("text-sm font-semibold tabular-nums", scoreTextColor(score))}>
        {score.toFixed(1)}%
      </span>
    </div>
  );
}

/**
 * Modal d'ajustement d'une affectation.
 * Permet au RH de changer le cours assigné et d'ajouter une note d'audit.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Affiche la modale si vrai.
 * @param {Object|null} props.proposal - Proposition à ajuster.
 * @param {Function} props.onClose - Callback de fermeture.
 * @param {Function} props.onSave - Callback de sauvegarde (id, { cours, notes? }).
 * @param {Array<Object>} props.courses - Liste des cours sélectionnables.
 * @returns {JSX.Element|null} La modale, ou null si fermée/sans proposition.
 */
export default function AjustementModal({ isOpen, proposal, onClose, onSave,courses }) {
  const [selectedCoursId, setSelectedCoursId] = useState(proposal?.cours.id ?? "");
  const [notes,           setNotes]           = useState("");

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    if (isOpen) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen || !proposal) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const cours = courses.find((c) => c.id === selectedCoursId);
    if (!cours) return;
    onSave(proposal.id, { cours, notes: notes.trim() || undefined });
  };

  const inputCls =
    "w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl " +
    "focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 " +
    "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 transition";

  const isSameAsCurrent = selectedCoursId === proposal.cours.id;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 id="modal-title" className="text-base font-semibold text-slate-800 dark:text-slate-200">
              Ajuster l&apos;affectation
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              L&apos;ajustement est tracé dans le journal d&apos;audit
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Professeur + Score courant */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Professeur</p>
              <div className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {proposal.professeur.prenom} {proposal.professeur.nom}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{proposal.professeur.email}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Score actuel</p>
              <div className="px-3 py-2.5">
                <ScoreBar score={proposal.score} />
              </div>
            </div>
          </div>

          {/* Cours actuel */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Cours actuel</p>
            <div className="px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400">
              {proposal.cours.nom}
              <span className="ml-2 text-slate-400">({proposal.cours.code})</span>
            </div>
          </div>

          {/* Nouveau cours */}
          <div>
            <label htmlFor="modal-cours" className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
              Nouveau cours
            </label>
            <select
              id="modal-cours"
              value={selectedCoursId}
              onChange={(e) => setSelectedCoursId(e.target.value)}
              required
              className={inputCls}
            >
              <option value="">Sélectionner un cours…</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id} disabled={c.id === proposal.cours.id}>
                  {c.nom} ({c.code}){c.id === proposal.cours.id ? " — actuel" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="modal-notes" className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
              Notes{" "}
              <span className="font-normal normal-case text-slate-400">(optionnel)</span>
            </label>
            <textarea
              id="modal-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Raison de l'ajustement..."
              maxLength={200}
              className={cn(inputCls, "min-h-18 resize-none")}
            />
            <p className="text-[10px] text-slate-400 mt-1 text-right">{notes.length}/200</p>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!selectedCoursId || isSameAsCurrent}
              className="px-4 py-2.5 text-sm font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition inline-flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
