/**
 * @module app/dashboard/admin/skills/page
 * @description Page admin de gestion des compétences — rend {@link module:features/admin/SkillsSection}.
 */

import SkillsSection from "@/features/admin/SkillsSection";

/**
 * Page de gestion des compétences (admin).
 * @returns {JSX.Element} La section des compétences.
 */
export default function SkillsPage() {
  return <SkillsSection />;
}
