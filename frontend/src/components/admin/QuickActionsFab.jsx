"use client";

/**
 * @module components/admin/QuickActionsFab
 * @description Bouton d'action flottant (FAB) offrant des raccourcis rapides selon
 * le rôle (lancer une analyse, créer session/cours/utilisateur).
 */

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Plus, X, CalendarRange, BookOpen, UserPlus, Sparkles } from "lucide-react";

/** Raccourcis d'action disponibles par rôle. */
const ACTIONS_BY_ROLE = {
  ADMIN: [
    { label: "Lancer une analyse", href: "/dashboard/admin/affectations",            icon: Sparkles,      color: "bg-violet-500 hover:bg-violet-600" },
    { label: "Nouvelle session",   href: "/dashboard/admin/sessions?create=true",    icon: CalendarRange, color: "bg-blue-500 hover:bg-blue-600"     },
    { label: "Nouveau cours",      href: "/dashboard/admin/courses?create=true",     icon: BookOpen,      color: "bg-emerald-500 hover:bg-emerald-600" },
    { label: "Nouvel utilisateur", href: "/dashboard/admin/users?create=true",       icon: UserPlus,      color: "bg-amber-500 hover:bg-amber-600"   },
  ],
  RH: [
    { label: "Lancer une analyse", href: "/dashboard/rh/affectations",            icon: Sparkles,      color: "bg-violet-500 hover:bg-violet-600" },
    { label: "Nouvelle session",   href: "/dashboard/rh/sessions?create=true",    icon: CalendarRange, color: "bg-blue-500 hover:bg-blue-600"     },
  ],
};

export default function QuickActionsFab({ role = "ADMIN" }) {
  const ACTIONS = ACTIONS_BY_ROLE[role] ?? ACTIONS_BY_ROLE.ADMIN;
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={containerRef} className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {/* Menu des actions */}
      {open && (
        <div className="flex flex-col items-end gap-2.5">
          {ACTIONS.map((a, i) => {
            const Icon = a.icon;
            return (
              <Link
                key={a.label}
                href={a.href}
                onClick={() => setOpen(false)}
                className="group flex items-center gap-3 animate-in slide-in-from-right-4 fade-in"
                style={{ animationDelay: `${i * 40}ms`, animationFillMode: "backwards" }}
              >
                <span className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg shadow-md whitespace-nowrap group-hover:shadow-lg transition">
                  {a.label}
                </span>
                <span className={`w-11 h-11 rounded-full ${a.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </span>
              </Link>
            );
          })}
        </div>
      )}

      {/* Bouton principal */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fermer le menu d'actions" : "Ouvrir le menu d'actions"}
        className={`w-14 h-14 rounded-full text-white flex items-center justify-center shadow-xl transition-all duration-300 ${
          open
            ? "bg-slate-700 hover:bg-slate-800 rotate-90"
            : "bg-[hsl(134,35%,45%)] hover:bg-[hsl(134,35%,35%)] hover:scale-105"
        }`}
      >
        {open ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
      </button>
    </div>
  );
}
