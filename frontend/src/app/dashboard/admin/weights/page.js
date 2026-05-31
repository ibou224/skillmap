/**
 * @module app/dashboard/admin/weights/page
 * @description Page admin de configuration des pondérations — rend {@link module:features/weights/WeightsConfigPage}.
 */

import WeightsSection from "@/features/weights/WeightsConfigPage"

/**
 * Page de configuration des pondérations de matching (admin).
 * @returns {JSX.Element} La page de configuration des pondérations.
 */
export default function WeightsPage() {
  return (
    <div className="p-6">
      <WeightsSection />
    </div>
  )
}
