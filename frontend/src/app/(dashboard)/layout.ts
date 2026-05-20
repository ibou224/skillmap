/**
 * @module (dashboard)/layout
 * @description Layout du dashboard — mock user pour dev frontend.
 * TODO: remplacer MOCK_USER par getServerSession(authOptions) quand le backend est prêt.
 */

import { redirect } from "next/navigation";
import DashboardShell from "./components/dashboardShell";

// ─── MOCK ─────────────────────────────────────────────────────────────────────
const MOCK_USER = {
  id:     "mock-1",
  prenom: "Jean",
  nom:    "Dupont",
  role:   "PROFESSEUR", // "PROFESSEUR" | "RH" | "ADMIN"
};
// ─────────────────────────────────────────────────────────────────────────────

export default async function DashboardLayout({ children }) {
  const user = MOCK_USER;
  if (!user) redirect("/auth/login");
  return <DashboardShell user={user}>{children}</DashboardShell>;
}