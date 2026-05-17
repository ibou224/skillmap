/**
 * @module professeur/sections/historySection
 * @description Historique des affectations par session pour le professeur.
 */

"use client";

import { useState } from "react";
import { History, Search, ChevronDown, ChevronUp } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Statut = "FINALISEE" | "AJUSTEE" | "PROPOSEE";

interface Cours {
  code: string;
  nom: string;
  programme: string;
  score: number;
  statut: Statut;
}

interface Session {
  id: string;
  label: string;
  annee: string;
  cours: Cours[];
}

// ─── Mock ─────────────────────────────────────────────────────────────────────

const STATUT_STYLE: Record<Statut, { bg: string; text: string; label: string }> = {
  FINALISEE: { bg: "bg-emerald-50", text: "text-emerald-600", label: "Finalisée" },
  AJUSTEE:   { bg: "bg-blue-50",    text: "text-blue-600",    label: "Ajustée"   },
  PROPOSEE:  { bg: "bg-amber-50",   text: "text-amber-600",   label: "Proposée"  },
};

const mockSessions: Session[] = [
  {
    id: "1", label: "Automne 2026", annee: "2026",
    cours: [
      { code: "420-1A3", nom: "Programmation Web",   programme: "PI",  score: 92, statut: "FINALISEE" },
      { code: "420-2B4", nom: "Base de données",     programme: "PI",  score: 85, statut: "FINALISEE" },
      { code: "420-3C5", nom: "IA Appliquée",        programme: "IAI", score: 84, statut: "AJUSTEE"   },
    ],
  },
  {
    id: "2", label: "Hiver 2026", annee: "2026",
    cours: [
      { code: "420-1A3", nom: "Programmation Web",   programme: "PI",  score: 88, statut: "FINALISEE" },
      { code: "420-4E7", nom: "Réseaux Informatiques", programme: "PI", score: 76, statut: "FINALISEE" },
    ],
  },
  {
    id: "3", label: "Automne 2025", annee: "2025",
    cours: [
      { code: "420-2B4", nom: "Base de données",     programme: "PI",  score: 81, statut: "FINALISEE" },
    ],
  },
];

// ─── Composant ────────────────────────────────────────────────────────────────

export default function HistorySection() {
  const [search, setSearch]       = useState("");
  const [expanded, setExpanded]   = useState<string>("1");

  const toggle = (id: string) => setExpanded((p) => (p === id ? "" : id));

  const filtered = mockSessions
    .map((s) => ({
      ...s,
      cours: s.cours.filter(
        (c) =>
          c.nom.toLowerCase().includes(search.toLowerCase()) ||
          c.code.includes(search)
      ),
    }))
    .filter((s) => s.cours.length > 0 || search === "");

  return (
    <div className="space-y-6">

      {/* ── Banner ── */}
      <div className="relative overflow-hidden rounded-3xl p-8 shadow-lg bg-gradient-to-br from-[hsl(134,35%,45%)] to-[#135d55]">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-10 -left-6 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Historique</h1>
            <p className="text-white/70 text-sm mt-1">Vos affectations par session.</p>
          </div>
          <span className="px-3 py-1.5 bg-white/15 text-white rounded-full text-xs font-bold">
            {mockSessions.length} sessions
          </span>
        </div>
      </div>

      {/* ── Filtre ── */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un cours…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(134,35%,45%)] transition"
          />
        </div>
      </div>

      {/* ── Accordéon sessions ── */}
      <div className="space-y-3">
        {filtered.map((session) => (
          <div key={session.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

            {/* En-tête session */}
            <button
              onClick={() => toggle(session.id)}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50/60 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[hsl(134,35%,45%)]/10 flex items-center justify-center">
                  <History className="w-4 h-4 text-[hsl(134,35%,45%)]" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-800 text-sm">{session.label}</p>
                  <p className="text-xs text-slate-400">{session.cours.length} cours</p>
                </div>
              </div>
              {expanded === session.id
                ? <ChevronUp className="w-4 h-4 text-slate-400" />
                : <ChevronDown className="w-4 h-4 text-slate-400" />
              }
            </button>

            {/* Tableau cours */}
            {expanded === session.id && (
              <div className="border-t border-slate-100">
                <table className="w-full">
                  <thead className="bg-slate-50/50">
                    <tr>
                      {["Code", "Cours", "Programme", "Score", "Statut"].map((h) => (
                        <th key={h} className="px-6 py-3 text-left text-[11px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {session.cours.map((c) => {
                      const s = STATUT_STYLE[c.statut];
                      return (
                        <tr key={c.code} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-3 text-xs font-mono text-slate-500">{c.code}</td>
                          <td className="px-6 py-3 text-sm font-semibold text-gray-800">{c.nom}</td>
                          <td className="px-6 py-3">
                            <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full">{c.programme}</span>
                          </td>
                          <td className="px-6 py-3 font-black text-emerald-600 text-sm">{c.score}%</td>
                          <td className="px-6 py-3">
                            <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${s.bg} ${s.text}`}>{s.label}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400 text-sm">Aucun résultat trouvé.</div>
        )}
      </div>

    </div>
  );
}