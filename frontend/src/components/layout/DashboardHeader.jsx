/**
 * @module _components/Header
 * @description Header fixe de l'application SkillMap.
 * Affiche le titre de l'application, la date du jour, les notifications
 * et un menu utilisateur avec avatar initiales + badge de rôle.
 *
 * @param isCollapsed - Synchronisé avec la sidebar pour l'offset left
 * @param user        - Données de l'utilisateur connecté
 * @param onLogout    - Callback déconnexion
 */

"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Bell, LogOut, ChevronDown, Settings, CalendarDays, Menu } from "lucide-react";
import ConfirmModal from "@/components/ui/ConfirmModal.jsx";
import { ROLE_COLORS, ROLE_LABELS, SETTINGS_HREF, getInitials, formatToday } from "@/constants/header.js";
import { useNotifications } from "@/hooks/useNotifications";


export default function DashboardHeader({
  isCollapsed,
  user,
  onLogout,
  onMobileMenuToggle,
}) {
  const [showMenu, setShowMenu]               = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNotifs, setShowNotifs]           = useState(false);
  const menuRef  = useRef(null);
  const notifRef = useRef(null);

  const { notifications, count, markAllRead, markOneRead } = useNotifications();


  useEffect(() => {
    if (!showMenu) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showMenu]);

  useEffect(() => {
    if (!showNotifs) return;
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showNotifs]);

  const roleColor  = ROLE_COLORS[user.role];
  const roleLabel  = ROLE_LABELS[user.role];
  const initials   = getInitials(user.prenom, user.nom);
  const todayLabel = formatToday();

  return (
    <>
      <header
        className={`fixed top-0 right-0 h-20 z-40 transition-[left] duration-300 ${
          isCollapsed ? "left-0 md:left-20" : "left-0 md:left-64"
        }`}
      >
        <div className="absolute inset-x-4 top-0 overflow-visible border border-white/80 bg-white/80 backdrop-blur-xl h-full rounded-b-2xl">
          <div className="relative flex h-full items-center justify-between gap-4 px-4 sm:px-5">

            {/* ── Hamburger mobile ── */}
            <button
              onClick={onMobileMenuToggle}
              aria-label="Menu"
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200/70 bg-white/70 text-gray-500 hover:bg-gray-100 transition-all shrink-0"
            >
              <Menu className="h-4.5 w-4.5" />
            </button>

            {/* ── Branding ── */}
            <div className="min-w-0 flex items-center gap-3">
              <div className="hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#135d55] via-[hsl(134_35%_45%)] to-[#8ac58d] shadow-[0_8px_20px_-10px_rgba(19,93,85,0.8)]">
                <span className="text-xs font-black tracking-[0.15em] text-white">SM</span>
              </div>
              <div className="min-w-0 flex items-center gap-2.5">
                <h1 className="truncate text-[1.2rem] font-black leading-none text-[#17463f]">
                  SkillMap
                </h1>
                <span className="hidden md:inline-flex items-center rounded-full border border-amber-100 bg-amber-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-amber-600">
                  {roleLabel}
                </span>
              </div>
            </div>

            {/* ── Contrôles droite ── */}
            <div className="flex items-center gap-2">
              {/* Date */}
              <div className="hidden xl:flex items-center gap-1.5 rounded-xl border border-emerald-100 bg-emerald-50/80 px-2.5 py-1.5 text-xs font-medium text-emerald-800">
                <CalendarDays className="h-3.5 w-3.5 text-[hsl(134_35%_45%)]" />
                <span className="capitalize">{todayLabel}</span>
              </div>

              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <button
                  aria-label="Notifications"
                  onClick={() => { setShowNotifs((p) => !p); if (!showNotifs) markAllRead(); }}
                  className="relative flex h-9 w-9 items-center cursor-pointer justify-center rounded-xl border border-gray-200/70 bg-white/70 text-gray-400 transition-all duration-200 hover:border-cite-green/30 hover:bg-cite-green/5 hover:text-cite-green"
                >
                  <Bell className="h-4.5 w-4.5" />
                  {count > 0 && (
                    <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white">
                      {count > 9 ? "9+" : count}
                    </span>
                  )}
                </button>

                {showNotifs && (
                  <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Notifications</span>
                    </div>
                    {notifications.length === 0 ? (
                      <p className="px-4 py-6 text-center text-sm text-slate-400">Aucune nouvelle notification</p>
                    ) : (
                      <ul>
                        {notifications.map((n) => (
                          <li key={n.id}>
                            {n.link ? (
                              <Link
                                href={n.link}
                                onClick={() => { markOneRead(n.id); setShowNotifs(false); }}
                                className="flex flex-col gap-0.5 px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0"
                              >
                                <span className="text-sm font-semibold text-slate-700">{n.title}</span>
                                {n.body && <span className="text-xs text-slate-400">{n.body}</span>}
                              </Link>
                            ) : (
                              <button
                                onClick={() => markOneRead(n.id)}
                                className="flex w-full flex-col gap-0.5 px-4 py-3 text-left hover:bg-slate-50 border-b border-slate-50 last:border-0"
                              >
                                <span className="text-sm font-semibold text-slate-700">{n.title}</span>
                                {n.body && <span className="text-xs text-slate-400">{n.body}</span>}
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              {/* Séparateur */}
              <div className="h-7 w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent" />

              {/* Menu utilisateur */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowMenu((p) => !p)}
                  aria-haspopup="menu"
                  aria-expanded={showMenu}
                  className={`flex items-center gap-2.5 rounded-xl border px-2 py-1.5 transition-all duration-200 cursor-pointer ${
                    showMenu
                      ? "border-cite-green/30 bg-cite-green/5 shadow-[0_8px_20px_-14px_rgba(19,93,85,0.4)]"
                      : "border-gray-200/60 bg-white/60 hover:border-gray-300 hover:bg-white"
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(134_35%_45%)] to-[#135d55] shadow-[0_8px_18px_-12px_rgba(19,93,85,0.9)]">
                    <span className="text-xs font-black tracking-wide text-white">{initials}</span>
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400" />
                  </div>

                  {/* Nom + rôle */}
                  <div className="hidden sm:flex sm:flex-col sm:items-start sm:leading-tight min-w-0">
                    <span className="truncate text-sm font-bold text-gray-800">
                      {user.prenom} {user.nom}
                    </span>
                    <span className={`inline-flex rounded-full border px-1.5 py-px text-[10px] font-semibold ${roleColor}`}>
                      {roleLabel}
                    </span>
                  </div>

                  <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-300 ${showMenu ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown */}
                {showMenu && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-gray-100 bg-white/96 shadow-[0_20px_40px_-20px_rgba(15,48,42,0.3)] backdrop-blur-xl z-50"
                  >
                    <div className="p-1.5">
                      <Link
                        role="menuitem"
                        href={SETTINGS_HREF[user.role]}
                        onClick={() => setShowMenu(false)}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                      >
                        <Settings className="h-4 w-4 shrink-0" />
                        Paramètres
                      </Link>
                      <button
                        role="menuitem"
                        onClick={() => { setShowMenu(false); setShowLogoutModal(true); }}
                        className="mt-0.5 flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 cursor-pointer"
                      >
                        <LogOut className="h-4 w-4 shrink-0" />
                        Déconnexion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

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
