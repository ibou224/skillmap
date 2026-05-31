/**
 * @module app/dashboard/admin/courses/[id]/page
 * @description Page de détail d'un cours (admin), identifié par son id d'URL.
 */

/**
 * Page de détail d'un cours.
 * @param {{ params: { id: string } }} props - Paramètres de route (id du cours).
 * @returns {JSX.Element} Le détail du cours.
 */
export default function CourseDetailPage({ params }) {
  return <div>Cours {params.id}</div>;
}
