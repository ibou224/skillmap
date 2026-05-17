/**
 * @module app/page
 * @description Page racine — redirige selon le rôle mocké.
 * TODO: remplacer MOCK_ROLE par getServerSession(authOptions) quand le backend est prêt.
 */

import { redirect } from "next/navigation";

// ─── MOCK ─────────────────────────────────────────────────────────────────────
// Changer cette valeur pour tester les différents rôles :
// "PROFESSEUR" | "RH" | "ADMIN"
const MOCK_ROLE = "ADMIN";
// ─────────────────────────────────────────────────────────────────────────────

export default async function Home() {
  if (MOCK_ROLE === "PROFESSEUR") redirect("/professeur");
  if (MOCK_ROLE === "RH")         redirect("/rh");
  if (MOCK_ROLE === "ADMIN")      redirect("/admin");

  redirect("/auth/login");
}