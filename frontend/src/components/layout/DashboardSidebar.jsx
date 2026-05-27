"use client";

import {signOut } from "next-auth/react";
import { useState } from "react";
import {LogOut, ChevronLeft, ChevronRight} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import ConfirmModal from "@/components/ui/ConfirmModal.jsx";
import { NAV_ITEMS, GROUP_LABELS, GROUP_ORDER, HOME_ROUTES } from "@/constants/sideBarConstante.js";


export default function DashboardSidebar({ role, isCollapsed, toggleSidebar, onLogout }) {
  const pathname = usePathname();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

  const filtered = NAV_ITEMS.filter((item) => role && item.roles.includes(role));

  const groups = GROUP_ORDER.reduce((acc, g) => {
    const items = filtered.filter((i) => i.group === g);
    if (items.length) acc.push({ key: g, items });
    return acc;
  }, []);

  const isActive = (href) => {
    if (HOME_ROUTES.includes(href)) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
        <aside className={`fixed top-0 left-0 h-screen z-50 flex flex-col
      bg-[linear-gradient(180deg,#4b9a5e_0%,#135d55,#1f6a5b_100%)]
      border-r border-white/10 shadow-[6px_0_20px_rgba(0,0,0,0.08)]
      transition-all duration-300 ${isCollapsed ? "w-20" : "w-64"}`}
    >
      <div className="absolute top-0 right-0 -translate-y-8 translate-x-12 w-64 h-64 border-30 border-white/5 rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-24 translate-y-1/2 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />

      {/* Logo */}
      <div className="relative h-20 flex items-center justify-center shrink-0 border-b border-white/10">
        {isCollapsed ? (
          <Image src="/images/logo-sm.png" alt="SkillMap" width={45} height={45} priority className="object-contain" />
        ) : (
          <Image src="/images/logo-blanc.png" alt="SkillMap" width={160} height={50} priority className="object-contain" />
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 overflow-hidden">
        {groups.map(({ key, items }, gi) => (
          <div key={key} className={gi > 0 ? "mt-3" : ""}>
            {!isCollapsed && (
              <div className="flex items-center gap-2 px-1 mb-1">
                <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/35 select-none whitespace-nowrap">
                  {GROUP_LABELS[key]}
                </span>
                <div className="flex-1 h-px bg-white/15" />
              </div>
            )}
            {isCollapsed && gi > 0 && <div className="mx-3 mb-2 h-px bg-white/15" />}

            <div className="space-y-0.5">
              {items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={isCollapsed ? item.label : undefined}
                    className={`relative group flex items-center gap-3 rounded-xl transition-all duration-200
                      ${isCollapsed ? "justify-center px-2 py-2" : "px-3 py-2"}
                      ${active ? "bg-white/10 text-white" : "text-white/75 hover:text-white hover:bg-white/5"}`}
                  >
                    {active && !isCollapsed && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-full" />
                    )}
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 transition-all group-hover:scale-110
                      ${active ? "text-white" : "text-white/70 group-hover:text-white"}`}>
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    {!isCollapsed && (
                      <span className={`truncate ${active ? "font-semibold" : "font-medium"}`}>
                        {item.label}
                      </span>
                    )}
                    {active && (
                      <span className={`w-2 h-2 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.6)] shrink-0
                        ${isCollapsed ? "absolute top-1.5 right-1.5" : "ml-auto"}`} />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Déconnexion */}
      <div className="px-3 py-2 border-t border-white/10 shrink-0">
        <button
          onClick={() => { setShowLogoutModal(true); }}
          title={isCollapsed ? "Déconnexion" : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer
            text-white/65 hover:bg-red-100 hover:text-red-700 transition-all duration-200 group
            ${isCollapsed ? "justify-center" : ""}`}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0 group-hover:bg-red-400/10 transition-colors">
            <LogOut className="h-4.5 w-4.5" />
          </span>
          {!isCollapsed && <span className="text-[14.5px] font-medium">Déconnexion</span>}
        </button>
      </div>

      {/* Toggle */}
      <button
        onClick={toggleSidebar}
        title={isCollapsed ? "Développer" : "Réduire"}
        className="absolute -right-3.5 top-1/3 -translate-y-1/2 z-50 cursor-pointer w-7 h-7 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-sm border border-white/25 shadow-[0_2px_10px_rgba(0,0,0,0.2)] hover:bg-white hover:border-white hover:shadow-[0_4px_16px_rgba(0,0,0,0.25)] transition-all duration-200 group">
        {isCollapsed
          ? <ChevronRight className="w-3.5 h-3.5 text-white group-hover:text-cite-green transition-colors duration-200" />
          : <ChevronLeft className="w-3.5 h-3.5 text-white group-hover:text-cite-green transition-colors duration-200" />
        }
      </button>
    </aside>

          {/* Modale confirmation logout */}
          <ConfirmModal
            isOpen={showLogoutModal}
            title="Confirmation de déconnexion"
            message="Souhaitez-vous vraiment quitter votre session ? Assurez-vous d'avoir enregistré vos modifications."
            onConfirm={() => { setShowLogoutModal(false); onLogout?.(); }}
            onCancel={() => setShowLogoutModal(false)}
            isLoading={false}
          />
    </>
  );
}
