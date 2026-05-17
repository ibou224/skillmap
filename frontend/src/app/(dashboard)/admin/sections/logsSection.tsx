"use client";

import { useState } from "react";
import { Activity, Search, Download, Filter } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type LogType = "ia" | "auth" | "cv" | "admin" | "erreur";

interface LogEntry {
  id: number;
  timestamp: string;
  type: LogType;
  acteur: string;
  action: string;
  detail: string;
  ok: boolean;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const mockLogs: LogEntry[] = [
  { id: 1,  timestamp: "2025-10-14 09:01:22", type: "ia",    acteur: "Système IA",      action: "Affectation automatique",      detail: "INF-101 → Jean Dupont (score 94%)",              ok: true  },
  { id: 2,  timestamp: "2025-10-14 09:05:11", type: "cv",    acteur: "Marie Tremblay",  action: "Upload CV",                    detail: "cv_tremblay_2025.pdf — 12 compétences extraites",ok: true  },
  { id: 3,  timestamp: "2025-10-14 09:12:45", type: "auth",  acteur: "p.gagnon",        action: "Connexion",                    detail: "IP 192.168.1.42 — Navigateur Chrome",            ok: true  },
  { id: 4,  timestamp: "2025-10-14 09:18:03", type: "erreur",acteur: "Système IA",      action: "Échec affectation",            detail: "RES-401 — Aucun professeur qualifié trouvé",     ok: false },
  { id: 5,  timestamp: "2025-10-14 09:30:00", type: "admin", acteur: "Sophie Martin",   action: "Ajout utilisateur",            detail: "Léa Bernard — rôle: professeur",                 ok: true  },
  { id: 6,  timestamp: "2025-10-14 10:00:15", type: "ia",    acteur: "Système IA",      action: "Affectation automatique",      detail: "MAT-201 → Pierre Gagnon (score 78%)",            ok: true  },
  { id: 7,  timestamp: "2025-10-14 10:22:33", type: "erreur",acteur: "l.bernard",       action: "Échec login",                  detail: "Mot de passe incorrect — 3e tentative",          ok: false },
  { id: 8,  timestamp: "2025-10-14 11:05:00", type: "admin", acteur: "Sophie Martin",   action: "Modification paramètre IA",    detail: "Poids expérience : 0.3 → 0.4",                  ok: true  },
  { id: 9,  timestamp: "2025-10-14 11:30:10", type: "cv",    acteur: "Marc Leblanc",    action: "Upload CV",                    detail: "cv_leblanc.docx — 7 compétences extraites",      ok: true  },
  { id: 10, timestamp: "2025-10-14 13:45:22", type: "ia",    acteur: "Système IA",      action: "Affectation automatique",      detail: "WEB-301 → Léa Bernard (score 91%)",              ok: true  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const typeMeta: Record<LogType, { label: string; color: string }> = {
  ia:     { label: "IA",     color: "bg-violet-100 text-violet-700" },
  auth:   { label: "Auth",   color: "bg-blue-100 text-blue-700"     },
  cv:     { label: "CV",     color: "bg-amber-100 text-amber-700"   },
  admin:  { label: "Admin",  color: "bg-emerald-100 text-emerald-700"},
  erreur: { label: "Erreur", color: "bg-red-100 text-red-600"       },
};

// ─── Composant ────────────────────────────────────────────────────────────────
export default function LogsSection() {
  const [search, setSearch]         = useState("");
  const [filterType, setFilterType] = useState<LogType | "tous">("tous");
  const [filterOk, setFilterOk]     = useState<"tous" | "ok" | "erreur">("tous");

  const filtered = mockLogs.filter((l) => {
    const q          = search.toLowerCase();
    const matchSearch= `${l.acteur} ${l.action} ${l.detail}`.toLowerCase().includes(q);
    const matchType  = filterType === "tous" || l.type === filterType;
    const matchOk    = filterOk  === "tous" || (filterOk === "ok" ? l.ok : !l.ok);
    return matchSearch && matchType && matchOk;
  });

  return (
    <div className="space-y-6">

      {/* ── Banner ── */}
      <div className="relative overflow-hidden rounded-3xl p-8 shadow-lg bg-gradient-to-br from-[hsl(134,35%,45%)] to-[#135d55]">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
        <h1 className="relative text-2xl sm:text-3xl font-black text-white">Journaux système</h1>
        <p className="relative text-white/70 text-sm mt-1">Historique complet des actions IA, utilisateurs et erreurs.</p>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input placeholder="Rechercher dans les logs…" value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(134,35%,45%)] transition" />
        </div>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value as LogType | "tous")}
          className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(134,35%,45%)] transition bg-white">
          <option value="tous">Tous les types</option>
          <option value="ia">IA</option>
          <option value="cv">CV</option>
          <option value="auth">Auth</option>
          <option value="admin">Admin</option>
          <option value="erreur">Erreur</option>
        </select>
        <select value={filterOk} onChange={(e) => setFilterOk(e.target.value as "tous" | "ok" | "erreur")}
          className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(134,35%,45%)] transition bg-white">
          <option value="tous">Tous les statuts</option>
          <option value="ok">Succès</option>
          <option value="erreur">Erreurs seulement</option>
        </select>
        <button className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition">
          <Download className="w-4 h-4" /> Exporter
        </button>
      </div>

      {/* ── Log list ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-50">
          {filtered.map((l) => {
            const tm = typeMeta[l.type];
            return (
              <div key={l.id} className={`flex items-start gap-4 px-5 py-3.5 hover:bg-slate-50/40 transition ${!l.ok ? "bg-red-50/30" : ""}`}>
                <div className="flex flex-col items-center gap-1 shrink-0 mt-0.5">
                  <Activity className={`w-4 h-4 ${l.ok ? "text-[hsl(134,35%,45%)]" : "text-red-500"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${tm.color}`}>{tm.label}</span>
                    <span className="text-sm font-semibold text-gray-700">{l.action}</span>
                    <span className="text-xs text-slate-400">par {l.acteur}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{l.detail}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[10px] text-slate-400 whitespace-nowrap">{l.timestamp.split(" ")[1]}</p>
                  <p className="text-[10px] text-slate-300">{l.timestamp.split(" ")[0]}</p>
                  <span className={`text-[10px] font-bold ${l.ok ? "text-emerald-600" : "text-red-500"}`}>
                    {l.ok ? "✓ OK" : "✗ KO"}
                  </span>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="py-16 text-center text-slate-400 text-sm">Aucun log correspondant.</div>
          )}
        </div>
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/40 text-xs text-slate-400 flex justify-between">
          <span>{filtered.length} entrée{filtered.length !== 1 ? "s" : ""}</span>
          <span>{mockLogs.filter((l) => !l.ok).length} erreur{mockLogs.filter((l) => !l.ok).length !== 1 ? "s" : ""} total</span>
        </div>
      </div>

    </div>
  );
}