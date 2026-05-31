/**
 * @module app/dashboard/admin/cvs/page
 * @description Page admin de consultation des CV — rend {@link module:features/rh/CvsSection}.
 */

import CvsSection from "@/features/rh/CvsSection";

/**
 * Page des CV côté administrateur.
 * @returns {JSX.Element} La section des CV.
 */
export default function AdminCvsPage() {
  return <CvsSection />;
}
