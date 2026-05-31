"use client";

/**
 * @module components/professeur/skills/SkillsEditor
 * @description Éditeur de compétences avec sélection du niveau (débutant/intermédiaire/avancé).
 */

import { Plus, Trash2 } from "lucide-react";

/** Niveaux de compétence et leurs styles. */
const NIVEAUX = [
  { value: "DEBUTANT",      short: "Débutant",      active: "bg-slate-600 text-white",    idle: "text-slate-400" },
  { value: "INTERMEDIAIRE", short: "Intermédiaire",  active: "bg-blue-600 text-white",     idle: "text-slate-400" },
  { value: "AVANCE",        short: "Avancé",         active: "bg-emerald-600 text-white",  idle: "text-slate-400" },
];

/**
 * Éditeur de la liste de compétences (nom + niveau).
 * @param {Object} props
 * @param {Array<{nom: string, niveau: string}>} [props.items] - Compétences éditées.
 * @param {Function} props.onChange - Callback de mise à jour de la liste.
 * @returns {JSX.Element} L'éditeur de compétences.
 */
export function SkillsEditor({ items = [], onChange }) {
  const update = (index, field, value) =>
    onChange(items.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  const add    = () => onChange([...items, { nom: "", niveau: "DEBUTANT" }]);
  const remove = (index) => onChange(items.filter((_, i) => i !== index));

  return (
    <div className="space-y-3">
      {items.length === 0 && (
        <p className="text-center text-sm text-slate-300 py-6">
          Aucune compétence. Cliquez sur le bouton ci-dessous pour commencer.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="group relative bg-slate-50 border border-slate-200 rounded-2xl p-4 hover:border-slate-300 transition"
          >
            {/* Supprimer */}
            <button
              onClick={() => remove(idx)}
              className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition"
            >
              <Trash2 size={13} />
            </button>

            {/* Nom */}
            <input
              value={item.nom}
              onChange={(e) => update(idx, "nom", e.target.value)}
              placeholder="Nom de la compétence…"
              className="w-full pr-8 text-sm font-semibold text-slate-700 bg-transparent border-0 outline-none placeholder:font-normal placeholder:text-slate-300"
            />

            {/* Niveau — pills segmentées */}
            <div className="flex gap-1.5 mt-3">
              {NIVEAUX.map((n) => (
                <button
                  key={n.value}
                  type="button"
                  onClick={() => update(idx, "niveau", n.value)}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-full transition ${
                    item.niveau === n.value
                      ? n.active
                      : "bg-white border border-slate-200 text-slate-400 hover:border-slate-300"
                  }`}
                >
                  {n.short}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bouton ajout */}
      <button
        onClick={add}
        className="flex items-center gap-2 px-4 py-3 w-full justify-center border-2 border-dashed border-slate-200 rounded-2xl text-sm text-slate-400 hover:border-[hsl(134,35%,45%)] hover:text-[hsl(134,35%,45%)] transition"
      >
        <Plus size={16} />
        Ajouter une compétence
      </button>
    </div>
  );
}
