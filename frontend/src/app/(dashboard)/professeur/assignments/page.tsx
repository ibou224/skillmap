/**
 * @module professeur/assignments/page
 * @description Page des affectations du professeur.
 * Server Component — délègue le rendu à AssignmentsSection.
 */

import AssignmentsSection from "../sections/assignmentsSection";

export default function AssignmentsPage() {
  return <AssignmentsSection />;
}