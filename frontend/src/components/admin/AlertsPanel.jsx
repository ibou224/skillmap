"use client";

/**
 * @module components/admin/AlertsPanel
 * @description Panneau d'alertes opérationnelles du dashboard admin, alimenté par
 * /api/admin/alerts (CV manquants, sessions sans pondération, comptes verrouillés…).
 */

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { AlertTriangle, AlertCircle, Info, CheckCircle2, ChevronRight, ShieldAlert } from "lucide-react";

/** Styles d'affichage par niveau de sévérité d'alerte. */
const SEVERITY_STYLE = {
  critical: {
    icon:    AlertCircle,
    border:  "border-red-200",
    bg:      "bg-red-50/60 hover:bg-red-50",
    iconBg:  "bg-red-100 text-red-600",
    label:   "Critique",
    labelBg: "bg-red-100 text-red-700",
  },
  warning: {
    icon:    AlertTriangle,
    border:  "border-amber-200",
    bg:      "bg-amber-50/60 hover:bg-amber-50",
    iconBg:  "bg-amber-100 text-amber-600",
    label:   "À traiter",
    labelBg: "bg-amber-100 text-amber-700",
  },
  info: {
    icon:    Info,
    border:  "border-blue-200",
    bg:      "bg-blue-50/60 hover:bg-blue-50",
    iconBg:  "bg-blue-100 text-blue-600",
    label:   "Info",
    labelBg: "bg-blue-100 text-blue-700",
  },
};

export default function AlertsPanel() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const setAlertsRef = useRef(setAlerts);
  const setLoadingRef = useRef(setLoading);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/admin/alerts");
        const json = await res.json();
        if (json.success) setAlertsRef.current(json.data);
      } catch {
        // silencieux
      } finally {
        setLoadingRef.current(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="h-4 w-32 bg-slate-100 rounded animate-pulse mb-3" />
        <div className="space-y-2">
          <div className="h-10 bg-slate-50 rounded-xl animate-pulse" />
          <div className="h-10 bg-slate-50 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  const counts = alerts.reduce(
    (acc, a) => ({ ...acc, [a.severity]: (acc[a.severity] ?? 0) + 1 }),
    {}
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-slate-400" />
          <h2 className="text-sm font-bold text-gray-700">Alertes système</h2>
          {alerts.length > 0 && (
            <span className="ml-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
              {alerts.length}
            </span>
          )}
        </div>
        {alerts.length > 0 && (
          <div className="flex items-center gap-1.5">
            {counts.critical > 0 && (
              <span className="text-[10px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">
                {counts.critical} critique{counts.critical > 1 ? "s" : ""}
              </span>
            )}
            {counts.warning > 0 && (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                {counts.warning} à traiter
              </span>
            )}
          </div>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 px-5 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          </div>
          <p className="text-sm font-semibold text-slate-700">Tout va bien</p>
          <p className="text-xs text-slate-400">Aucune action requise pour le moment.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-50">
          {alerts.map((a) => {
            const style = SEVERITY_STYLE[a.severity] ?? SEVERITY_STYLE.info;
            const Icon = style.icon;
            return (
              <Link
                key={a.id}
                href={a.link}
                className={`flex items-center gap-3 px-5 py-3 transition-colors ${style.bg}`}
              >
                <div className={`w-9 h-9 rounded-xl ${style.iconBg} flex items-center justify-center shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700">{a.title}</p>
                  <span className={`inline-block mt-0.5 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${style.labelBg}`}>
                    {style.label}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
