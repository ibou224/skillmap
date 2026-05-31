/**
 * @module components/professeur/certifications/CertificationsEditor
 * @description Éditeur de la liste des certifications du CV (ajout/édition/suppression).
 */

import { Plus, Award, Trash2 } from "lucide-react";

/** Classe CSS commune des champs de saisie. */
const inputCls =
  "w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(134,35%,45%)] transition bg-white";

/**
 * Formulaire d'une certification (sous-composant).
 * @param {Object} props
 * @param {Object} props.certification - Données de la certification.
 * @param {number} props.index - Index dans la liste.
 * @param {Function} props.onUpdate - Met à jour un champ.
 * @param {Function} props.onRemove - Supprime cette certification.
 * @param {boolean} props.canDelete - Autorise la suppression.
 * @returns {JSX.Element} Le formulaire de certification.
 */
function CertificationForm({ certification, index, onUpdate, onRemove, canDelete }) {
  return (
    <div className="relative border border-slate-100 rounded-2xl p-4 bg-slate-50/40 space-y-3">
      {canDelete && (
        <button
          onClick={onRemove}
          className="absolute top-3 right-3 text-slate-300 hover:text-red-400 transition"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
      <p className="text-xs font-bold text-[hsl(134,35%,45%)] uppercase tracking-widest">
        Certification {index + 1}
        
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
            <Award className="w-3 h-3" /> Titre
          </label>
          <input
            placeholder="AWS Certified Solutions Architect"
            value={certification.title ?? ""}
            onChange={(e) => onUpdate("title", e.target.value)}
            className={inputCls}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            Année
          </label>
          <input
            type="number"
            placeholder="2023"
            min={1990}
            max={2099}
            value={certification.year ?? ""}
            onChange={(e) => onUpdate("year", e.target.value ? Number(e.target.value) : null)}
            className={inputCls}
          />
        </div>
      </div>
    </div>
  );
}

export function CertificationsEditor({ certifications, onChange }) {
  const handleUpdate = (index, key, value) => {
    const updated = certifications.map((c, i) =>
      i === index ? { ...c, [key]: value } : c
    );
    onChange(updated);
  };

  const add = () => {
    onChange([...certifications, { id: Date.now(), title: "", year: null }]);
  };

  const remove = (index) => {
    onChange(certifications.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {certifications.map((cert, idx) => (
        <CertificationForm
          key={cert.id ?? idx}
          certification={cert}
          index={idx}
          onUpdate={(key, val) => handleUpdate(idx, key, val)}
          onRemove={() => remove(idx)}
          canDelete={true}
        />
      ))}
      <button
        onClick={add}
        className="flex items-center text-sm font-semibold text-[hsl(134,35%,45%)] hover:text-[hsl(134,35%,35%)]"
      >
        <Plus size={16} className="mr-1" /> Ajouter une certification
      </button>
    </div>
  );
}
