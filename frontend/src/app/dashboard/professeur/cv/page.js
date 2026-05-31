/**
 * @module app/dashboard/professeur/cv/page
 * @description Page professeur du CV — rend {@link module:features/professeur/cvStatutSection}
 * dans une frontière Suspense (utilise les paramètres d'URL).
 */

import { Suspense } from "react";
import CvStatusSection from "@/features/professeur/cvStatutSection";

/**
 * Page de gestion/statut du CV du professeur connecté.
 * @returns {JSX.Element} La section CV encapsulée dans un Suspense.
 */
export default function CvPage() {
  return (
    <Suspense>
      <CvStatusSection />
    </Suspense>
  );
}
