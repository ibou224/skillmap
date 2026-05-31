/**
 * @module app/dashboard/admin/affectations/page
 * @description Page admin des affectations — rend {@link module:features/affectations/AffectationsPage}.
 */

import AffectationPage from "@/features/affectations/AffectationsPage";

/**
 * Page d'affectations côté administrateur.
 * @returns {JSX.Element} La page d'affectations.
 */
export default function AffectationsAdminPage() {
  return <AffectationPage />;
}
