/**
 * @module components/professeur/skills/StringArrayEditor
 * @description Éditeur générique d'un tableau de chaînes (ex. langues), avec ajout/suppression.
 */

import { Plus, Trash2 } from "lucide-react";

/**
 * Éditeur d'une liste de chaînes de caractères.
 * @param {Object} props
 * @param {string[]} [props.items] - Valeurs éditées.
 * @param {Function} props.onChange - Callback de mise à jour de la liste.
 * @param {string} [props.placeholder='Ajouter…'] - Texte indicatif des champs.
 * @returns {JSX.Element} L'éditeur de chaînes.
 */
export function StringArrayEditor({ items = [], onChange, placeholder = "Ajouter…" }) {
  const update = (index, value) => {
    const newItems = items.map((item, i) => (i === index ? value : item));
    onChange(newItems);
  };

  const add = () => {
    onChange([...items, ""]);
  };

  const remove = (index) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div key={idx} className="flex gap-2 items-center">
          <input
            value={item}
            onChange={(e) => update(idx, e.target.value)}
            placeholder={placeholder}
            className="flex-1 px-2 py-1 text-sm border border-slate-200 rounded-lg"
          />
          <button onClick={() => remove(idx)} className="text-red-400 hover:text-red-600">
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