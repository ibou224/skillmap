"use client";

import { useState } from "react";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";
import { useLogin } from "@/hooks/useAuth";

export default function DashboardShell({ user, children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { logout } = useLogin();

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar
        role={user.role}
        isCollapsed={isCollapsed}
        toggleSidebar={() => setIsCollapsed((prev) => !prev)}
        onLogout={logout}
      />
      <div className={`flex-1 flex flex-col transition-[margin-left] duration-300 ${isCollapsed ? "ml-20" : "ml-64"}`}>
        <DashboardHeader
          user={user}
          isCollapsed={isCollapsed}
          onLogout={logout}
        />
        <main className="p-6 mt-20 bg-gray-50 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
