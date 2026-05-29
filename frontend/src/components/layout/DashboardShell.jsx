"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";
import { useLogin } from "@/hooks/useAuth";
import { useIdleTimeout } from "@/hooks/useIdleTimeout";


/* ─────────────────────────────────────────────
   Shell principal
───────────────────────────────────────────── */
export default function DashboardShell({ user, sessionError, children }) {
  const [isCollapsed, setIsCollapsed]   = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const { logout } = useLogin();
  useIdleTimeout();

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setIsMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <>
      <div className="flex min-h-screen">
        {/* Overlay mobile */}
        {isMobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}

        <DashboardSidebar
          role={user.role}
          isCollapsed={isCollapsed}
          toggleSidebar={() => setIsCollapsed((p) => !p)}
          onLogout={logout}
          isMobileOpen={isMobileOpen}
          onMobileClose={() => setIsMobileOpen(false)}
        />

        <div
          className={`flex-1 flex flex-col transition-[margin-left] duration-300 ${
            isCollapsed ? "md:ml-20" : "md:ml-64"
          }`}
        >
          <DashboardHeader
            user={user}
            isCollapsed={isCollapsed}
            onLogout={logout}
            onMobileMenuToggle={() => setIsMobileOpen((p) => !p)}
          />
          <main className="p-4 sm:p-6 mt-20 bg-gray-50 flex-1">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
