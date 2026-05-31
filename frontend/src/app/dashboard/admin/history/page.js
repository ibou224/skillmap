/**
 * @module app/dashboard/admin/history/page
 * @description Page admin de l'historique des affectations — rend {@link module:features/history/HistoryPage}.
 */

import HistoryPage from "@/features/history/HistoryPage";

/**
 * Page d'historique des affectations (admin).
 * @returns {JSX.Element} La page d'historique.
 */
export default function AdminHistoryPage() {
  return <HistoryPage />;
}
