/**
 * @module app/dashboard/professeur/historique/page
 * @description Page professeur de l'historique des CV — rend {@link module:features/professeur/HistoriqueCvSection}.
 */

import HistoriqueCvSection from "@/features/professeur/HistoriqueCvSection";

/**
 * Page d'historique des versions de CV du professeur connecté.
 * @returns {JSX.Element} La section d'historique des CV.
 */
export default function HistoriquePage() {
  return <HistoriqueCvSection />;
}
