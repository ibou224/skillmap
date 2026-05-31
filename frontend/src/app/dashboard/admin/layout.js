/**
 * @module app/dashboard/admin/layout
 * @description Layout du dashboard administrateur : protège l'accès en
 * redirigeant les utilisateurs non-ADMIN vers /dashboard.
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * Layout protégé réservé au rôle ADMIN.
 * @param {{ children: React.ReactNode }} props - Contenu du dashboard.
 * @returns {Promise<React.ReactNode>} Le contenu si autorisé, sinon redirige.
 */
export default async function AdminLayout({ children }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/dashboard");
  return children;
}
