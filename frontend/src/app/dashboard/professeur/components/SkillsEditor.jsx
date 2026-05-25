"use client";

import { Plus, Trash2 } from "lucide-react";

const NIVEAUX = [
  { value: "DEBUTANT",      label: "Débutant" },
  { value: "INTERMEDIAIRE", label: "Intermédiaire" },
  { value: "AVANCE",        label: "Avancé" },
];

/**
 * Éditeur de compétences avec niveau de maîtrise.
 *
 * Chaque compétence est un objet `{ nom: string, niveau: string }`.
 * Le niveau est sélectionnable parmi DEBUTANT, INTERMEDIAIRE, AVANCE.
 *
 * @param {Array<{ nom: string, niveau: string }>} items
 * @param {Function} onChange - Appelé avec le nouveau tableau à chaque modification.
 */
export function SkillsEditor({ items = [], onChange }) {
  const update = (index, field, value) => {
    const updated = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onChange(updated);
  };

  const add = () => {
    onChange([...items, { nom: "", niveau: "DEBUTANT" }]);
  };

  const remove = (index) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div key={idx} className="flex gap-2 items-center">
          <input
            value={item.nom}
            onChange={(e) => update(idx, "nom", e.target.value)}
            placeholder="Ex : React, Python…"
            className="flex-1 px-2 py-1 text-sm border border-slate-200 rounded-lg"
          />
          <select
            value={item.niveau}
            onChange={(e) => update(idx, "niveau", e.target.value)}
            className="px-2 py-1 text-sm border border-slate-200 rounded-lg bg-white text-slate-600"
          >
            {NIVEAUX.map((n) => (
              <option key={n.value} value={n.value}>
                {n.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => remove(idx)}
            className="text-red-400 hover:text-red-600"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      <button
        onClick={add}
        className="flex items-center text-sm font-semibold text-[hsl(134,35%,45%)]"
      >
        <Plus size={16} className="mr-1" /> Ajouter
      </button>
    </div>
  );
}