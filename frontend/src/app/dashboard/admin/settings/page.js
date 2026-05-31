/**
 * @module app/dashboard/admin/settings/page
 * @description Page de paramètres du compte admin — récupère la session côté
 * serveur puis rend {@link module:features/settings/AccountSettingsSection}.
 */

import { auth } from "@/lib/auth";
import AccountSettingsSection from "@/features/settings/AccountSettingsSection";

/**
 * Page de paramètres de compte (admin).
 * @returns {Promise<JSX.Element>} La section de paramètres alimentée par l'utilisateur connecté.
 */
export default async function SettingsPage() {
  const session = await auth();
  return <AccountSettingsSection user={session.user} />;
}
