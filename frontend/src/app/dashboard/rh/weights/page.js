/**
 * @module app/dashboard/rh/weights/page
 * @description Page RH de configuration des pondérations — rend {@link module:features/weights/WeightsConfigPage}.
 */

import WeightsSection from "@/features/weights/WeightsConfigPage"

/**
 * Page de configuration des pondérations de matching (RH).
 * @returns {JSX.Element} La page de configuration des pondérations.
 */
export default function WeightsPage() {
  return (
    <div className="p-6">
      <WeightsSection />
    </div>
  )
}
