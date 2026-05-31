/**
 * @module app/dashboard/rh/page
 * @description Page d'accueil du dashboard RH (analytique) — rend {@link module:features/rh/AnalyticsSection}.
 */

import AnalyticsSection from "@/features/rh/AnalyticsSection";

/**
 * Tableau de bord d'accueil RH (analytique des affectations).
 * @returns {JSX.Element} La section d'analytique.
 */
export default function RhPage() {
  return <AnalyticsSection />;
}
