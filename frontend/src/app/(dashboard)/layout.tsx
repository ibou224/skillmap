/**
 * @module (dashboard)/layout
 * @description Layout du dashboard — mock user pour dev frontend.
 * TODO: remplacer MOCK_USER par getServerSession(authOptions) quand le backend est prêt.
 */

import DashboardShell from "./components/dashboardShell";

// ─── MOCK ─────────────────────────────────────────────────────────────────────
// Synchroniser avec MOCK_ROLE dans app/page.tsx
// "PROFESSEUR" | "RH" | "ADMIN"
const MOCK_USER = {
  id:     "mock-1",
  prenom: "Jean",
  nom:    "Dupont",
  role:   "ADMIN" as const,
};
// ─────────────────────────────────────────────────────────────────────────────

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell user={MOCK_USER}>{children}</DashboardShell>;
}