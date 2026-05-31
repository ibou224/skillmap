/**
 * @module app/dashboard/professeur/layout
 * @description Layout du dashboard professeur : protège l'accès en redirigeant
 * les utilisateurs non-PROFESSEUR vers /dashboard.
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * Layout protégé réservé au rôle PROFESSEUR.
 * @param {{ children: React.ReactNode }} props - Contenu du dashboard.
 * @returns {Promise<React.ReactNode>} Le contenu si autorisé, sinon redirige.
 */
export default async function ProfesseurLayout({ children }) {
  const session = await auth();
  if (session?.user?.role !== "PROFESSEUR") redirect("/dashboard");
  return children;
}
