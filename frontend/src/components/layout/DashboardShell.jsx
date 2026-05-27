"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";
import { useLogin } from "@/hooks/useAuth";
import { useIdleTimeout } from "@/hooks/useIdleTimeout";

/* ─────────────────────────────────────────────
   Bannière session expirée (RefreshTokenError)
───────────────────────────────────────────── */
function SessionExpiredBanner({ secondsLeft }) {
  return (
    <div className="fixed top-0 inset-x-0 z-100 flex items-center justify-center gap-3 bg-amber-500 px-4 py-3 text-white text-sm font-medium shadow-lg">
      <span className="inline-block w-2 h-2 rounded-full bg-white animate-pulse" />
      Votre session a expiré. Redirection vers la page de connexion dans{" "}
      <span className="font-bold">{secondsLeft}s</span>…
    </div>
  );
}

/* ─────────────────────────────────────────────
   Shell principal
───────────────────────────────────────────── */
export default function DashboardShell({ user, sessionError, children }) {
  const [isCollapsed, setIsCollapsed]   = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [countdown, setCountdown]       = useState(5);

  const { logout } = useLogin();
  useIdleTimeout();

  const isExpired = sessionError === "RefreshTokenError";

  /* Décompte 5s → signOut (setState uniquement dans le callback) */
  useEffect(() => {
    if (!isExpired) return;

    let n = 5;
    const interval = setInterval(() => {
      n -= 1;
      setCountdown(n);
      if (n <= 0) {
        clearInterval(interval);
        signOut({ callbackUrl: "/login" });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isExpired]);

  /* Fermer la sidebar mobile au resize vers desktop */
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setIsMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <>
      {isExpired && <SessionExpiredBanner secondsLeft={countdown} />}

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
