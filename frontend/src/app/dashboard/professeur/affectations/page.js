/**
 * @module app/dashboard/professeur/affectations/page
 * @description Page professeur des affectations — rend {@link module:features/professeur/AffectationSection}.
 */

import Affectationsection from "@/features/professeur/AffectationSection";

/**
 * Page d'affectations du professeur connecté.
 * @returns {JSX.Element} La section des affectations.
 */
export default function AffectationsPage() {
  return (
    <div>
      <Affectationsection />
    </div>
  );
}
