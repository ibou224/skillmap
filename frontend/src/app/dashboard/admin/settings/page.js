import { auth } from "@/lib/auth";
import AccountSettingsSection from "@/features/settings/AccountSettingsSection";

export default async function SettingsPage() {
  const session = await auth();
  return <AccountSettingsSection user={session.user} />;
}
