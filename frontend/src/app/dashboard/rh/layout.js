import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function RhLayout({ children }) {
  const session = await auth();
  if (session?.user?.role !== "RH") redirect("/dashboard");
  return children;
}
