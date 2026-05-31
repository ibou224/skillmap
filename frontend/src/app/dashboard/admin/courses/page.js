/**
 * @module app/dashboard/admin/courses/page
 * @description Page admin de gestion des cours — rend {@link module:features/admin/CoursesSection}.
 */

import CoursesSection from "@/features/admin/CoursesSection";

/**
 * Page de gestion des cours (admin).
 * @returns {JSX.Element} La section de gestion des cours.
 */
export default function CoursesPage() {
  return <CoursesSection />;
}
