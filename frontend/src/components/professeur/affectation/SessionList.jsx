/**
 * @module components/professeur/affectation/SessionList
 * @description Liste des cours d'une session (rend une {@link module:components/professeur/affectation/CourseRow} par cours).
 */

import { CourseRow } from "./CourseRow";

/**
 * Liste de lignes de cours.
 * @param {Object} props
 * @param {Array<Object>} props.cours - Cours à afficher.
 * @returns {JSX.Element} La liste de cours.
 */
export function SessionList({ cours }) {
  return (
    <div className="divide-y divide-slate-50">
      {cours.map((c) => (
        <CourseRow key={c.code} cours={c} />
      ))}
    </div>
  );
}
