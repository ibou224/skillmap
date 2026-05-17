"use client";

import { useState } from "react";
import { ClipboardList, Search } from "lucide-react";

type Statut = "PROPOSEE" | "AJUSTEE" | "FINALISEE";

interface Assignment {
  id: string; code: string; nom: string;
  programme: string; etape: number;
  score: number; statut: Statut;
}

const STATUT_STYLE: Record<Statut, { bg: string; text: string; label: string }> = {
  PROPOSEE:  { bg: "bg-amber-50",   text: "text-amber-600",  label: "Proposée"  },
  AJUSTEE:   { bg: "bg-blue-50",    text: "text-blue-600",   label: "Ajustée"   },
  FINALISEE: { bg: "bg-emerald-50", text: "text-emerald-600",label: "Finalisée" },
};

const mock: Assignment[] = [
  { id:"1", code:"420-1A3", nom:"Programmation Web",   programme:"PI",  etape:1, score:92, statut:"FINALISEE" },
  { id:"2", code:"420-2B4", nom:"Base de données",     programme:"PI",  etape:2, score:85, statut:"FINALISEE" },
  { id:"3", code:"420-3C5", nom:"IA Appliquée",        programme:"IAI", etape:3, score:84, statut:"AJUSTEE"   },
  { id:"4", code:"420-1D6", nom:"Algorithmique",       programme:"PI",  etape:1, score:78, statut:"PROPOSEE"  },
];

export default function AssignmentsSection() {
  const [search, setSearch] = useState("");

  const filtered = mock.filter(
    (a) => a.nom.toLowerCase().includes(search.toLowerCase()) || a.code.includes(search)
  );

  return (
    <div className="space-y-6">

      {/* ── Banner ── */}
      <div className="relative overflow-hidden rounded-3xl p-8 shadow-lg bg-gradient-to-br from-[hsl(134,35%,45%)] to-[#135d55]">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Mes affectations</h1>
            <p className="text-white/70 text-sm mt-1">Session active : Automne 2026</p>
          </div>
          <span className="px-3 py-1.5 bg-white/15 text-white rounded-full text-xs font-bold">{mock.length} cours</span>
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

      {/* ── Tableau ── */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              {["Code", "Cours", "Programme", "Étape", "Score", "Statut"].map((h) => (
                <th key={h} className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-widest text-slate-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-16 text-slate-400 text-sm">Aucune affectation trouvée.</td></tr>
            ) : filtered.map((a) => {
              const s = STATUT_STYLE[a.statut];
              return (
                <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 text-xs font-mono text-slate-500">{a.code}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-800">{a.nom}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full">{a.programme}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{a.etape}</td>
                  <td className="px-6 py-4 font-black text-emerald-600">{a.score}%</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${s.bg} ${s.text}`}>{s.label}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}