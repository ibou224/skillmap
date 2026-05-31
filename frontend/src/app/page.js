/**
 * @module app/page
 * @description Page racine de l'application : redirige immédiatement vers /login.
 */

import { redirect } from 'next/navigation';

/**
 * Point d'entrée racine — redirige vers la page de connexion.
 * @returns {never} Effectue toujours une redirection.
 */
export default function Home() {
  redirect('/login');
}
