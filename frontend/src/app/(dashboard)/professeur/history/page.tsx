/**
 * @module professeur/history/page
 * @description Page historique des sessions du professeur.
 * Server Component — délègue le rendu à HistorySection.
 */

import HistorySection from "../sections/historySection";

export default function HistoryPage() {
  return <HistorySection />;
}