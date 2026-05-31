/**
 * @module app/dashboard/admin/page
 * @description Page d'accueil du dashboard admin — rend {@link module:features/admin/HomeSection}.
 */

import HomeSection from "@/features/admin/HomeSection";

/**
 * Tableau de bord d'accueil administrateur.
 * @returns {JSX.Element} La section d'accueil admin.
 */
export default function AdminDashboard() {
  return (
    <div>
      <HomeSection />
    </div>
  );
}
