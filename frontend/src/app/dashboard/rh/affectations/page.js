/**
 * @module app/dashboard/rh/affectations/page
 * @description Page RH des affectations — rend {@link module:features/affectations/AffectationsPage}.
 */

import AffectationPage from "@/features/affectations/AffectationsPage";

/**
 * Page d'affectations côté RH.
 * @returns {JSX.Element} La page d'affectations.
 */
export default function RhAffectationsPage() {
  return <AffectationPage />;
}
