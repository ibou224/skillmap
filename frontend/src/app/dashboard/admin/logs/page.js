/**
 * @module app/dashboard/admin/logs/page
 * @description Page admin des logs d'audit — rend {@link module:features/admin/logsSection}.
 */

import LogsSection from "@/features/admin/logsSection";

/**
 * Page des logs d'audit (admin).
 * @returns {JSX.Element} La section des logs.
 */
export default function LogsPage() {
  return <LogsSection />;
}
