import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

const ROLE_HOME = {
  ADMIN:      "/dashboard/admin",
  RH:         "/dashboard/rh",
  PROFESSEUR: "/dashboard/professeur",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  console.log("Session utilisateur :", session);

  const home = ROLE_HOME[session.user.role];
  if (!home) redirect("/login");

  redirect(home);
}
