/**
 * @module app/dashboard/rh/sessions/page
 * @description Page RH de gestion des sessions — rend {@link module:features/admin/SessionSection}.
 */

import SessionSection from "@/features/admin/SessionSection"

/**
 * Page de gestion des sessions académiques (RH).
 * @returns {JSX.Element} La section des sessions.
 */
export default function RhSessionsPage() {
  return <SessionSection />;
}
