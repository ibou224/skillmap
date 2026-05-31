/**
 * @module app/dashboard/rh/analytics/page
 * @description Ancienne page d'analytique RH, désormais redirigée vers la page
 * d'accueil RH (/dashboard/rh) qui héberge l'analytique.
 */

import { redirect } from "next/navigation";

/**
 * Redirige vers la page d'accueil RH (analytique).
 * @returns {never} Effectue toujours une redirection.
 */
export default function RhAnalyticsPage() {
  redirect("/dashboard/rh");
}
