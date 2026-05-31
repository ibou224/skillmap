/**
 * @module features/weights/CritereCard
 * @description Carte d'un critère de pondération : affichage de la valeur (barre)
 * et édition (slider) en mode édition.
 */

import { Pencil, Check, X } from "lucide-react";
import { WeightBar } from "./WeightBar";
import { WeightSlider } from "./WeightSlider";

/**
 * Carte d'édition d'un critère de pondération.
 * @param {Object} props
 * @param {string} props.id - Clé du critère.
 * @param {Object} props.config - Configuration du critère (label, bornes, icône).
 * @param {number} props.value - Valeur courante (%).
 * @param {boolean} props.isEditing - Mode édition actif.
 * @param {Function} props.onChange - Callback de changement de valeur.
 * @param {Function} props.onStartEdit - Passe en mode édition.
 * @param {Function} props.onCancel - Annule l'édition.
 * @returns {JSX.Element} La carte de critère.
 */
export function CritereCard({
  id, 
  config, 
  value, 
  isEditing, 
  onChange, 
  onStartEdit, 
  onCancel, 
  onSave,
  hasUnsavedChanges 
}) {
  return (
    <div className={`bg-white rounded-2xl border p-6 transition-all ${
      isEditing 
        ? "border-blue-300 shadow-md ring-2 ring-blue-100" 
        : "border-slate-200 hover:border-slate-300"
    }`}>
      
      {/* En-tête */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl ${config.lightColor} flex items-center justify-center text-xl`}>
            {config.icon}
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-sm">{config.label}</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{config.description}</p>
          </div>
        </div>
        
        {!isEditing ? (
          <button
            onClick={onStartEdit}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors flex-shrink-0"
            title="Modifier"
          >
            <Pencil className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={onSave}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
              title="Enregistrer"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={onCancel}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
              title="Annuler"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Contrôle */}
      {isEditing ? (
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <input
              type="number"
              min={config.min}
              max={config.max}
              value={value}
              onChange={(e) => onChange(Number(e.target.value))}
              className="w-20 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-center font-bold"
            />
            <span className="text-sm text-slate-500">%</span>
            <div className="flex-1">
              <WeightSlider
                value={value}
                onChange={onChange}
                min={config.min}
                max={config.max}
                color={config.color}
              />
            </div>
          </div>
          <div className="text-xs text-slate-400">
            Plage autorisée : {config.min}% – {config.max}%
          </div>
        </div>
      ) : (
        <WeightBar value={value} color={config.color} lightColor={config.lightColor} />
      )}
    </div>
  );
}