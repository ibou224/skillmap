/**
 * @module components/professeur/experiences/ExperiencesEditor
 * @description Éditeur de la liste des expériences (ajout/édition/suppression).
 */

import { Plus } from "lucide-react";
import ExperienceForm from "./ExperienceForm";

/**
 * Éditeur de la liste des expériences professionnelles.
 * @param {Object} props
 * @param {Array<Object>} props.experiences - Liste des expériences.
 * @param {Function} props.onChange - Callback de mise à jour de la liste.
 * @returns {JSX.Element} L'éditeur d'expériences.
 */
export function ExperiencesEditor({ experiences, onChange }) {
  const handleUpdate = (index, key, value) => {
    const updated = experiences.map((exp, i) =>
      i === index ? { ...exp, [key]: value } : exp
    );
    onChange(updated);
  };

  const add = () => {
    const newExp = {
      id: Date.now(),
      poste: "",
      entreprise: "",
      debut: "",
      fin: "",
      description: "",
    };
    onChange([...experiences, newExp]);
  };

  const remove = (index) => {
    onChange(experiences.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {experiences.map((exp, idx) => (
        <ExperienceForm
          key={exp.id || idx}
          exp={exp}
          index={idx}
          onUpdate={(key, val) => handleUpdate(idx, key, val)}
          onRemove={() => remove(idx)}
          canDelete={experiences.length > 1}
        />
      ))}
      <button
        onClick={add}
        className="flex items-center text-sm font-semibold text-[hsl(134,35%,45%)] hover:text-[hsl(134,35%,35%)]"
      >
        <Plus size={16} className="mr-1" /> Ajouter une expérience
      </button>
    </div>
  );
}