// app/page.js
/**
 * @module app/page
 * @description Page d'accueil racine (/) qui redirige vers /auth/login.
 */

import { redirect } from 'next/navigation';

export default function Home() {
  // Redirection immédiate côté serveur vers la route officielle de login
  redirect('/login');
}