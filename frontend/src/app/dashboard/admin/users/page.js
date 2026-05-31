/**
 * @module app/dashboard/admin/users/page
 * @description Page admin de gestion des utilisateurs — rend {@link module:features/admin/usersSection}.
 */

import UsersSection from "@/features/admin/usersSection";

/**
 * Page de gestion des utilisateurs (admin).
 * @returns {JSX.Element} La section des utilisateurs.
 */
export default function UserPage() {
  return (
    <div>
      <UsersSection />
    </div>
  );
}
