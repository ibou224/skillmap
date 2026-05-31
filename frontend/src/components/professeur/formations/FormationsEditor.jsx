/**
 * @module components/professeur/formations/FormationsEditor
 * @description Éditeur de la liste des formations (ajout/édition/suppression).
 */

import { Plus } from "lucide-react";
import FormationForm from "./FormationForm";

/**
 * Éditeur de la liste des formations.
 * @param {Object} props
 * @param {Array<Object>} props.formations - Liste des formations.
 * @param {Function} props.onChange - Callback de mise à jour de la liste.
 * @returns {JSX.Element} L'éditeur de formations.
 */
export function FormationsEditor({ formations, onChange }) {
  const handleUpdate = (index, key, value) => {
    const updated = formations.map((f, i) =>
      i === index ? { ...f, [key]: value } : f
    );
    onChange(updated);
  };

  const add = () => {
    const newForm = {
      id: Date.now(),
      diplome: "",
      etablissement: "",
      anneeObtention: "",
    };
    onChange([...formations, newForm]);
  };

  const remove = (index) => {
    onChange(formations.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {formations.map((form, idx) => (
        <FormationForm
          key={form.id || idx}
          formation={form}
          index={idx}
          onUpdate={(key, val) => handleUpdate(idx, key, val)}
          onRemove={() => remove(idx)}
          canDelete={formations.length > 1}
        />
      ))}
      <button
        onClick={add}
        className="flex items-center text-sm font-semibold text-[hsl(134,35%,45%)] hover:text-[hsl(134,35%,35%)]"
      >
        <Plus size={16} className="mr-1" /> Ajouter une formation
      </button>
    </div>
  );
}