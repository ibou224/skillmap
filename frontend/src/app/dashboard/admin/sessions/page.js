/**
 * @module app/dashboard/admin/sessions/page
 * @description Page admin de gestion des sessions — rend {@link module:features/admin/SessionSection}.
 */

import SessionSection from "@/features/admin/SessionSection";

/**
 * Page de gestion des sessions académiques (admin).
 * @returns {JSX.Element} La section des sessions.
 */
export default function SessionPage() {
  return (
    <div className="w-full h-full">
      <SessionSection />
    </div>
  );
}
