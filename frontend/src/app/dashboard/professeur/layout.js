import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ProfesseurLayout({ children }) {
  const session = await auth();
  if (session?.user?.role !== "PROFESSEUR") redirect("/dashboard");
  return children;
}
