/**
 * @module components/DashboardShell
 * @description Wrapper client du dashboard — gère la Sidebar, le Header et le layout principal.
 * Reçoit l'utilisateur depuis le Server Component layout.tsx via props.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardSidebar from "../components/dashboardSidebar";
import DashboardHeader from "../components/dashboardHeader";
import type { SessionUser } from "../components/types";

interface DashboardShellProps {
  user: SessionUser;
  children: React.ReactNode;
}

export default function DashboardShell({ user, children }: DashboardShellProps) {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.replace("/auth/login");
  };

  return (
    <div className="flex">
      <DashboardSidebar
        role={user.role}
        isCollapsed={isCollapsed}
        toggleSidebar={() => setIsCollapsed((p) => !p)}
        onLogout={handleLogout}
      />

      <div
        className={`flex-1 transition-[margin-left] duration-300 ${
          isCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        <DashboardHeader
          isCollapsed={isCollapsed}
          user={user}
          onLogout={handleLogout}
        />
        <main className="p-6 mt-20 bg-gray-50 min-h-[calc(100vh-5rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}