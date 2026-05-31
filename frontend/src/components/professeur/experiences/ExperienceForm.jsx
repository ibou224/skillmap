// components/ExperienceForm.jsx
/**
 * @module components/professeur/experiences/ExperienceForm
 * @description Formulaire d'édition d'une expérience professionnelle du CV.
 */

import { Briefcase, Trash2 } from "lucide-react";

/** Classe CSS commune des champs de saisie. */
const inputCls = "w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(134,35%,45%)] transition bg-white";

/**
 * Formulaire d'une expérience.
 * @param {Object} props
 * @param {Object} props.exp - Données de l'expérience.
 * @param {number} props.index - Index dans la liste.
 * @param {Function} props.onUpdate - Met à jour un champ.
 * @param {Function} props.onRemove - Supprime cette expérience.
 * @param {boolean} props.canDelete - Autorise la suppression.
 * @returns {JSX.Element} Le formulaire d'expérience.
 */
export default function ExperienceForm({ exp, index, onUpdate, onRemove, canDelete }) {
  return (
    <div className="relative border border-slate-100 rounded-2xl p-4 bg-slate-50/40 space-y-3">
      {canDelete && (
        <button onClick={onRemove} className="absolute top-3 right-3 text-slate-300 hover:text-red-400 transition">
          <Trash2 className="w-4 h-4" />
        </button>
      )}
      <p className="text-xs font-bold text-[hsl(134,35%,45%)] uppercase tracking-widest">Expérience {index + 1}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
            <Briefcase className="w-3 h-3" /> Poste occupé
          </label>
          <input
            placeholder="Développeur fullstack"
            value={exp.poste ?? ""}
            onChange={(e) => onUpdate("poste", e.target.value)}
            className={inputCls}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Entreprise</label>
          <input
            placeholder="Acme Inc."
            value={exp.entreprise ?? ""}
            onChange={(e) => onUpdate("entreprise", e.target.value)}
            className={inputCls}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Date de début</label>
          <input
            type="month"
            value={exp.debut ?? ""}
            onChange={(e) => onUpdate("debut", e.target.value)}
            className={inputCls}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Date de fin</label>
          <input
            type="month"
            placeholder="Laissez vide si en cours"
            value={exp.fin ?? ""}
            onChange={(e) => onUpdate("fin", e.target.value || null)}
            className={inputCls}
          />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Description des responsabilités</label>
          <textarea
            rows={4}
            placeholder="Décrivez vos missions et réalisations…"
            value={exp.description ?? ""}
            onChange={(e) => onUpdate("description", e.target.value)}
            className={inputCls}
          />
        </div>
      </div>
    </div>
  );
}