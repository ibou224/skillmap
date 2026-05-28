import { redirect } from "next/navigation";

// L'analytique est maintenant la page d'accueil RH (/dashboard/rh).
export default function RhAnalyticsPage() {
  redirect("/dashboard/rh");
}
