/**
 * @module app/dashboard/layout
 * @description Layout commun du dashboard : vérifie l'authentification côté
 * serveur (redirige vers /login si absente) et enveloppe le contenu dans
 * {@link module:components/layout/DashboardShell}.
 */

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/layout/DashboardShell';

/**
 * Layout protégé du dashboard.
 * @param {{ children: React.ReactNode }} props - Contenu de la page.
 * @returns {Promise<JSX.Element>} Le shell du dashboard, ou une redirection si non connecté.
 */
export default async function DashboardLayout({ children }) {
  const session = await auth();

  if (!session?.user) redirect('/login');

  return (
    <DashboardShell user={session.user} sessionError={session?.error}>
      {children}
    </DashboardShell>
  );
}
