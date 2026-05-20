/**
 * @module _components/DashboardSidebar
 * @description Sidebar fixe du dashboard SkillMap.
 * Adapte les items de navigation selon le rôle (PROFESSEUR | RH | ADMIN).
 * Supporte le mode collapsed (icônes seules) avec toggle.
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, FileText, ClipboardList, History,
  BarChart3, CalendarRange, Weight,
  Users, BookOpen, Lightbulb, ScrollText,
  LogOut, ChevronLeft, ChevronRight,
} from "lucide-react";
import ConfirmModal from "../components/ui/ConfirmModal";

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = "PROFESSEUR" | "RH" | "ADMIN";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  roles: UserRole[];
  group: "main" | "gestion" | "admin";
}

interface DashboardSidebarProps {
  role: UserRole;
  isCollapsed: boolean;
  toggleSidebar: () => void;
  onLogout?: () => void;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const GROUP_LABELS: Record<string, string> = {
  main:    "Navigation",
  gestion: "Gestion",
  admin:   "Administration",
};

const GROUP_ORDER = ["main", "gestion", "admin"] as const;

const NAV_ITEMS: NavItem[] = [
  { icon: Home,          label: "Accueil",        href: "/professeur",             roles: ["PROFESSEUR"], group: "main"    },
  { icon: FileText,      label: "Mon CV",          href: "/professeur/cv",          roles: ["PROFESSEUR"], group: "main"    },
  { icon: ClipboardList, label: "Affectations",    href: "/professeur/assignments", roles: ["PROFESSEUR"], group: "main"    },
  { icon: History,       label: "Historique",      href: "/professeur/history",     roles: ["PROFESSEUR"], group: "main"    },
  { icon: BarChart3,     label: "Vue d'ensemble",  href: "/rh",                     roles: ["RH"],         group: "main"    },
  { icon: CalendarRange, label: "Sessions",         href: "/rh/sessions",            roles: ["RH"],         group: "gestion" },
  { icon: Weight,        label: "Pondérations",    href: "/rh/weights",             roles: ["RH"],         group: "gestion" },
  { icon: ClipboardList, label: "Affectations",    href: "/rh/assignments",         roles: ["RH"],         group: "gestion" },
  { icon: History,       label: "Historique",      href: "/rh/history",             roles: ["RH"],         group: "gestion" },
  { icon: Users,         label: "Utilisateurs",    href: "/admin",                  roles: ["ADMIN"],      group: "main"    },
  { icon: BookOpen,      label: "Programmes",      href: "/admin/programs",         roles: ["ADMIN"],      group: "admin"   },
  { icon: FileText,      label: "Cours",           href: "/admin/courses",          roles: ["ADMIN"],      group: "admin"   },
  { icon: Lightbulb,     label: "Compétences",     href: "/admin/skills",           roles: ["ADMIN"],      group: "admin"   },
  { icon: ScrollText,    label: "Logs",            href: "/admin/logs",             roles: ["ADMIN"],      group: "admin"   },
];

// ─── Composant ────────────────────────────────────────────────────────────────

export default function DashboardSidebar({ role, isCollapsed, toggleSidebar, onLogout }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const filtered = NAV_ITEMS.filter((item) => item.roles.includes(role));
  const groups = GROUP_ORDER.reduce<{ key: string; items: NavItem[] }[]>((acc, g) => {
    const items = filtered.filter((i) => i.group === g);
    if (items.length) acc.push({ key: g, items });
    return acc;
  }, []);

  const isActive = (href: string) => {
    const exact = ["/professeur", "/rh", "/admin"];
    return exact.includes(href) ? pathname === href : pathname.startsWith(href);
  };

  // ── Classes calculées une seule fois (pas de template literals multi-lignes) ──
  const asideClass = [
    "fixed top-0 left-0 h-screen z-50 flex flex-col",
    "bg-[linear-gradient(180deg,#4b9a5e_0%,#135d55_50%,#1f6a5b_100%)]",
    "border-r border-white/10 shadow-[6px_0_20px_rgba(0,0,0,0.08)]",
    "transition-all duration-300",
    isCollapsed ? "w-20" : "w-64",
  ].join(" ");

  const toggleClass = [
    "absolute -right-3.5 top-1/3 -translate-y-1/2 z-50 cursor-pointer",
    "w-7 h-7 rounded-full flex items-center justify-center",
    "bg-white/10 backdrop-blur-sm border border-white/25",
    "shadow-[0_2px_10px_rgba(0,0,0,0.2)]",
    "hover:bg-white hover:border-white hover:shadow-[0_4px_16px_rgba(0,0,0,0.25)]",
    "transition-all duration-200 group",
  ].join(" ");

  const logoutBtnClass = [
    "w-full flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer",
    "text-white/65 hover:bg-red-100 hover:text-red-700 transition-all duration-200 group",
    isCollapsed ? "justify-center" : "",
  ].join(" ");

  return (
    <aside className={asideClass}>

      {/* Décors */}
      <div className="absolute top-0 right-0 -translate-y-8 translate-x-12 w-64 h-64 border-[30px] border-white/5 rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-24 translate-y-1/2 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />

      {/* Logo */}
      <div className="relative h-20 flex items-center justify-center shrink-0 border-b border-white/10 px-4">
        {isCollapsed ? (
          <span className="text-lg font-black text-white tracking-widest">SK</span>
        ) : (
          <div className="flex flex-col items-start gap-0.5 w-full">
            <span className="text-xl font-black tracking-tight text-white leading-none">SkillMap</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Dashboard</span>
          </div>
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

                const linkClass = [
                  "relative group flex items-center gap-3 rounded-xl transition-all duration-200",
                  isCollapsed ? "justify-center px-2 py-2" : "px-3 py-2",
                  active ? "bg-white/10 text-white" : "text-white/75 hover:text-white hover:bg-white/5",
                ].join(" ");

                const iconClass = [
                  "flex h-8 w-8 items-center justify-center rounded-lg shrink-0 transition-all group-hover:scale-110",
                  active ? "text-white" : "text-white/70 group-hover:text-white",
                ].join(" ");

                const dotClass = [
                  "w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)] shrink-0",
                  isCollapsed ? "absolute top-1.5 right-1.5" : "ml-auto",
                ].join(" ");

                return (
                  <Link key={item.href} href={item.href} title={isCollapsed ? item.label : undefined} className={linkClass}>
                    {active && !isCollapsed && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-full" />
                    )}
                    <div className={iconClass}>
                      <Icon className="h-[18px] w-[18px]" />
                    </div>
                    {!isCollapsed && (
                      <span className={active ? "truncate text-sm font-semibold" : "truncate text-sm font-medium"}>
                        {item.label}
                      </span>
                    )}
                    {active && <span className={dotClass} />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Déconnexion */}
      <div className="px-3 py-2 border-t border-white/10 shrink-0">
        <button onClick={() => setShowLogoutModal(true)} title={isCollapsed ? "Déconnexion" : undefined} className={logoutBtnClass}>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0 group-hover:bg-red-400/10 transition-colors">
            <LogOut className="h-[18px] w-[18px]" />
          </span>
          {!isCollapsed && <span className="text-[14.5px] font-medium">Déconnexion</span>}
        </button>
      </div>

      {/* Modal logout */}
      <ConfirmModal
        isOpen={showLogoutModal}
        title="Se déconnecter ?"
        message="Votre session sera fermée et vous serez redirigé vers la page de connexion."
        onConfirm={() => { setShowLogoutModal(false); onLogout?.(); }}
        onCancel={() => setShowLogoutModal(false)}
        isLoading={false}
      />

      {/* Toggle collapse */}
      <button onClick={toggleSidebar} title={isCollapsed ? "Développer" : "Réduire"} className={toggleClass}>
        {isCollapsed
          ? <ChevronRight className="w-3.5 h-3.5 text-white group-hover:text-[hsl(134,35%,45%)] transition-colors" />
          : <ChevronLeft  className="w-3.5 h-3.5 text-white group-hover:text-[hsl(134,35%,45%)] transition-colors" />
        }
      </button>

    </aside>
  );
}