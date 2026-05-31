/**
 * @module app/dashboard/rh/layout
 * @description Layout du dashboard RH : protège l'accès en redirigeant les
 * utilisateurs hors RH/ADMIN vers /dashboard.
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * Layout protégé réservé aux rôles RH et ADMIN.
 * @param {{ children: React.ReactNode }} props - Contenu du dashboard.
 * @returns {Promise<React.ReactNode>} Le contenu si autorisé, sinon redirige.
 */
export default async function RhLayout({ children }) {
  const session = await auth();
  const role = session?.user?.role;
  if (role !== "RH" && role !== "ADMIN") redirect("/dashboard");
  return children;
}
