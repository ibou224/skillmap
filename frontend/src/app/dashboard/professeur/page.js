/**
 * @module app/dashboard/professeur/page
 * @description Page d'accueil du dashboard professeur — rend {@link module:features/professeur/HomeSection}.
 */

import HomeSection from "@/features/professeur/HomeSection";

/**
 * Tableau de bord d'accueil du professeur connecté.
 * @returns {JSX.Element} La section d'accueil professeur.
 */
export default function ProfesseurDashboard() {
  return (
    <div>
      <HomeSection />
    </div>
  );
}
