/**
 * @module app/dashboard/professeur/profil/page
 * @description Page professeur du profil — rend {@link module:features/professeur/ProfilSection}.
 */

import ProfilSection from "@/features/professeur/ProfilSection";

/**
 * Page de profil du professeur connecté.
 * @returns {JSX.Element} La section de profil.
 */
export default function ProfilPage() {
  return (
    <div className="p-6">
      <ProfilSection />
    </div>
  );
}
