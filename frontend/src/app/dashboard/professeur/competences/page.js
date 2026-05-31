/**
 * @module app/dashboard/professeur/competences/page
 * @description Page professeur des compétences — rend {@link module:features/professeur/CompetencesSection}.
 */

import CompetencesSection from "@/features/professeur/CompetencesSection";

/**
 * Page des compétences du professeur connecté.
 * @returns {JSX.Element} La section des compétences.
 */
export default function CompetencesPage() {
  return <CompetencesSection />;
}
