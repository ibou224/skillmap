// src/app/dashboard/professeur/competences/page.jsx
import HistorySection from '../sections/HistorySection'; // import par défaut, sans accolades

export default function CompetencesPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Compétences</h1>
      <HistorySection />
    </div>
  );
}