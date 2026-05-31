/**
 * @module app/dashboard/rh/cvs/page
 * @description Page RH de consultation des CV — rend {@link module:features/rh/CvsSection}.
 */

import CvsSection from "@/features/rh/CvsSection";

/**
 * Page des CV côté RH.
 * @returns {JSX.Element} La section des CV.
 */
export default function RhCvsPage() {
  return <CvsSection />;
}
