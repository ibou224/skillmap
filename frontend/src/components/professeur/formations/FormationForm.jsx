/**
 * @module components/professeur/formations/FormationForm
 * @description Formulaire d'édition d'une formation/diplôme du CV.
 */

import { GraduationCap, Trash2 } from "lucide-react";

/** Classe CSS commune des champs de saisie. */
const inputCls = "w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(134,35%,45%)] transition bg-white";

/** Niveaux de diplôme proposés. */
const NIVEAU_OPTIONS = [
  { value: "DOCTORATE",  label: "Doctorat" },
  { value: "MASTERS",    label: "Maîtrise" },
  { value: "BACHELORS",  label: "Baccalauréat" },
  { value: "DEC",        label: "DEC / Diplôme technique" },
  { value: "OTHER",      label: "Autre" },
];

/**
 * Formulaire d'une formation.
 * @param {Object} props
 * @param {Object} props.formation - Données de la formation.
 * @param {number} props.index - Index dans la liste.
 * @param {Function} props.onUpdate - Met à jour un champ.
 * @param {Function} props.onRemove - Supprime cette formation.
 * @param {boolean} props.canDelete - Autorise la suppression.
 * @returns {JSX.Element} Le formulaire de formation.
 */
export default function FormationForm({ formation, index, onUpdate, onRemove, canDelete }) {
  return (
    <div className="relative border border-slate-100 rounded-2xl p-4 bg-slate-50/40 space-y-3">
      {canDelete && (
        <button onClick={onRemove} className="absolute top-3 right-3 text-slate-300 hover:text-red-400 transition">
          <Trash2 className="w-4 h-4" />
        </button>
      )}
      <p className="text-xs font-bold text-[hsl(134,35%,45%)] uppercase tracking-widest">Formation {index + 1}</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
            <GraduationCap className="w-3 h-3" /> Diplôme / Titre
          </label>
          <input
            placeholder="Maîtrise en informatique"
            value={formation.diplome ?? ""}
            onChange={(e) => onUpdate("diplome", e.target.value)}
            className={inputCls}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Année d&apos;obtention</label>
          <input
            type="number" placeholder="2020" min={1950} max={2099}
            value={formation.anneeObtention ?? ""}
            onChange={(e) => onUpdate("anneeObtention", e.target.value)}
            className={inputCls}
          />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Niveau du diplôme</label>
          <select
            value={formation.niveauDiplome ?? "OTHER"}
            onChange={(e) => onUpdate("niveauDiplome", e.target.value)}
            className={inputCls}
          >
            {NIVEAU_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Établissement</label>
          <input
            placeholder="Université d'Ottawa"
            value={formation.etablissement ?? ""}
            onChange={(e) => onUpdate("etablissement", e.target.value)}
            className={inputCls}
          />
        </div>
      </div>
    </div>
  );
}