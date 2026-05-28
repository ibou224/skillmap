"use client";

import { useState, useEffect } from "react";
import {
  ScrollText, RefreshCw, AlertCircle, Search,
  ChevronLeft, ChevronRight, User, Filter, X,
} from "lucide-react";
import { ACTION_PRIORITY, ENTITY_TYPES } from "@/lib/log_utils.js";

const PAGE_SIZE = 20;

/* ─── Helpers ─────────────────────────────────────────────── */

function formatDate(iso) {
  return new Date(iso).toLocaleString("fr-CA", {
    day:    "numeric",
    month:  "short",
    year:   "numeric",
    hour:   "2-digit",
    minute: "2-digit",
  });
}

const ACTION_STYLE = {
  CREATE:        { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400", label: "Création"     },
  UPDATE:        { bg: "bg-blue-50",    text: "text-blue-700",    dot: "bg-blue-400",    label: "Modification"  },
  DELETE:        { bg: "bg-red-50",     text: "text-red-700",     dot: "bg-red-400",     label: "Suppression"   },
  LOGIN:         { bg: "bg-violet-50",  text: "text-violet-700",  dot: "bg-violet-400",  label: "Connexion"     },
  LOGOUT:        { bg: "bg-slate-50",   text: "text-slate-600",   dot: "bg-slate-400",   label: "Déconnexion"   },
  LOGIN_ATTEMPT: { bg: "bg-orange-50",  text: "text-orange-700",  dot: "bg-orange-400",  label: "Tentative"     },
  RESTORE:       { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-400",   label: "Restauration"  },
  VALIDATE:      { bg: "bg-teal-50",    text: "text-teal-700",    dot: "bg-teal-400",    label: "Validation"    },
  ANALYZE:       { bg: "bg-indigo-50",  text: "text-indigo-700",  dot: "bg-indigo-400",  label: "Analyse IA"    },
};

function actionStyle(action) {
  return (
    ACTION_STYLE[action?.toUpperCase()] ?? {
      bg: "bg-slate-50", text: "text-slate-600", dot: "bg-slate-400", label: action ?? "—",
    }
  );
}

function priorityStyle(action) {
  return ACTION_PRIORITY[action?.toUpperCase()] ?? { label: "Normale", bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400" };
}

function LogRow({ log }) {
  const style = actionStyle(log.action);
  const prio  = priorityStyle(log.action);

  return (
    <tr className="border-b border-slate-100 text-sm hover:bg-slate-50/70 transition-colors">
      <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
        {formatDate(log.createdAt)}
      </td>
      <td className="px-4 py-3">
        {log.user ? (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
              <User className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-700 leading-none">
                {log.user.prenom} {log.user.nom}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">{log.user.email}</p>
            </div>
          </div>
        ) : (
          <span className="text-xs text-slate-300 italic">Système</span>
        )}
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${prio.bg} ${prio.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${prio.dot}`} />
          {log.user?.role ?? <span className="text-slate-300">—</span>}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full ${style.bg} ${style.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
          {style.label ?? log.action ?? "—"}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full ${prio.bg} ${prio.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${prio.dot}`} />
          {prio.label}
        </span>
      </td>
      <td className="px-4 py-3 text-[10px] font-mono text-slate-300">
        {log.ipAddress ?? "—"}
      </td>
      <td className="px-4 py-3 text-xs text-slate-500 max-w-xs truncate">
        {log.metadata?.message ?? <span className="text-slate-300">—</span>}
      </td>
    </tr>
  );
}

const ACTIONS = Object.keys(ACTION_STYLE);

export default function LogsSection() {
  const [logs, setLogs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [search, setSearch]     = useState("");
  const [filterAction, setFilterAction]         = useState("");
  const [filterEntityType, setFilterEntityType] = useState("");
  const [page, setPage]         = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/logs");
        if (!res.ok) throw new Error(`Erreur ${res.status}`);
        const { data } = await res.json();
        if (!cancelled) { setLogs(data ?? []); setError(null); }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [refreshKey]);

  function handleRefresh() {
    setLoading(true);
    setError(null);
    setRefreshKey((k) => k + 1);
  }

  // Filtrage client-side
  const q = search.toLowerCase();
  const filtered = logs.filter((log) => {
    if (filterAction     && log.action     !== filterAction)     return false;
    if (filterEntityType && log.entityType !== filterEntityType) return false;
    if (q) {
      return (
        log.action?.toLowerCase().includes(q)            ||
        log.entityType?.toLowerCase().includes(q)        ||
        log.user?.email?.toLowerCase().includes(q)       ||
        log.user?.nom?.toLowerCase().includes(q)         ||
        log.user?.prenom?.toLowerCase().includes(q)      ||
        log.metadata?.message?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated   = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const hasFilters  = search || filterAction || filterEntityType;

  const handleFilterChange = (setter) => (e) => { setter(e.target.value); setPage(1); };
  const resetFilters = () => {
    setSearch(""); setFilterAction(""); setFilterEntityType(""); setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Bannière */}
      <div className="relative overflow-hidden rounded-3xl p-8 shadow-lg bg-linear-to-br from-[hsl(134,35%,45%)] to-[#135d55]">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ScrollText className="w-5 h-5 text-white/70" />
              <h1 className="text-2xl sm:text-3xl font-black text-white">Journaux d&apos;activité</h1>
            </div>
            <p className="text-white/70 text-sm">
              {filtered.length} entrée{filtered.length !== 1 ? "s" : ""}
              {hasFilters ? " correspondante" + (filtered.length !== 1 ? "s" : "") : ` sur ${logs.length}`}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="self-start px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-white text-sm font-medium flex items-center gap-2 transition disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Actualiser
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par action, entité, email…"
              value={search}
              onChange={handleFilterChange(setSearch)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(134,35%,45%)] transition"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={filterAction}
              onChange={handleFilterChange(setFilterAction)}
              className="pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(134,35%,45%)] transition appearance-none bg-white"
            >
              <option value="">Toutes les actions</option>
              {ACTIONS.map((a) => (
                <option key={a} value={a}>{ACTION_STYLE[a].label}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={filterEntityType}
              onChange={handleFilterChange(setFilterEntityType)}
              className="pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(134,35%,45%)] transition appearance-none bg-white"
            >
              <option value="">Tous les types</option>
              {ENTITY_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {hasFilters && (
            <button
              onClick={resetFilters}
              className="px-3 py-2 text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 rounded-xl hover:bg-slate-100 transition"
            >
              <X className="w-4 h-4" /> Effacer
            </button>
          )}
        </div>
      </div>

      {/* Alerte erreur */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* Tableau */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">Date</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">Utilisateur</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">Rôle</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">Action</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">Priorité</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">IP</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">Message</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex items-center justify-center gap-2 text-slate-400">
                      <RefreshCw size={18} className="animate-spin" />
                      <span className="text-sm">Chargement…</span>
                    </div>
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <ScrollText className="w-10 h-10 text-slate-200" />
                      <p className="text-sm">
                        {hasFilters ? "Aucun résultat pour ces filtres." : "Aucun log enregistré pour l'instant."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((log) => <LogRow key={log.id} log={log} />)
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-xs text-slate-400">
              Page {currentPage} / {totalPages} — {filtered.length} entrée{filtered.length !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-4 h-4 text-slate-500" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .reduce((acc, p, i, arr) => {
                  if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "..." ? (
                    <span key={`e-${i}`} className="px-2 text-slate-400 text-xs">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-7 h-7 rounded-lg text-xs font-semibold transition
                        ${p === currentPage ? "bg-[hsl(134,35%,45%)] text-white" : "hover:bg-slate-100 text-slate-500"}`}
                    >
                      {p}
                    </button>
                  )
                )}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-40 transition"
              >
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
