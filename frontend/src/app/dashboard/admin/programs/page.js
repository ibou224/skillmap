/**
 * @module app/dashboard/admin/programs/page
 * @description Page admin de gestion des programmes — rend {@link module:features/admin/programsSection}.
 */

import ProgramsSection from "@/features/admin/programsSection";

/**
 * Page de gestion des programmes (admin).
 * @returns {JSX.Element} La section des programmes.
 */
export default function ProgramsPage() {
  return <ProgramsSection />;
}
