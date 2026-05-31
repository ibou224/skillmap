/**
 * @module app/dashboard/page
 * @description Page de routage du dashboard : redirige l'utilisateur connecté
 * vers le tableau de bord correspondant à son rôle.
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

/** Page d'accueil du dashboard par rôle. */
const ROLE_HOME = {
  ADMIN:      "/dashboard/admin",
  RH:         "/dashboard/rh",
  PROFESSEUR: "/dashboard/professeur",
};

/**
 * Redirige vers le dashboard du rôle de l'utilisateur (ou /login sinon).
 * @returns {Promise<never>} Effectue toujours une redirection.
 */
export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  console.log("Session utilisateur :", session);

  const home = ROLE_HOME[session.user.role];
  if (!home) redirect("/login");

  redirect(home);
}
