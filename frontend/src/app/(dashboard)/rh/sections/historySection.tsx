"use client";

import { useState } from "react";
import { History, Search } from "lucide-react";

interface Entry {
  id: string; code: string; cours: string;
  session: string; score: number; statut: "FINALISEE" | "ANNULEE";
}

const mock: Entry[] = [
  { id:"1", code:"420-1A3", cours:"Programmation Web", session:"Hiver 2026",   score:88, statut:"FINALISEE" },
  { id:"2", code:"420-2B4", cours:"Base de données",   session:"Hiver 2026",   score:91, statut:"FINALISEE" },
  { id:"3", code:"420-3C5", cours:"IA Appliquée",      session:"Automne 2025", score:79, statut:"FINALISEE" },
  { id:"4", code:"420-1D6", cours:"Algorithmique",     session:"Automne 2025", score: 0, statut:"ANNULEE"   },
  { id:"5", code:"420-2B4", cours:"Base de données",   session:"Hiver 2025",   score:85, statut:"FINALISEE" },
];

export default function HistorySection() {
  const [search, setSearch] = useState("");

  const filtered = mock.filter(
    (e) => e.cours.toLowerCase().includes(search.toLowerCase()) ||
           e.session.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">

      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl p-8 shadow-lg bg-gradient-to-br from-[hsl(134,35%,45%)] to-[#135d55]">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Historique</h1>
            <p className="text-white/70 text-sm mt-1">Toutes les sessions passées</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/15 text-white rounded-full text-xs font-bold">
            <History className="w-3.5 h-3.5" />
            {mock.length} entrées
          </div>
        </div>
      </div>

      {/* Filtre */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher dans l'historique…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(134,35%,45%)] transition"
          />
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              {["Code", "Cours", "Session", "Score", "Statut"].map((h) => (
                <th key={h} className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-widest text-slate-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-16 text-slate-400 text-sm">Aucun historique trouvé.</td></tr>
            ) : filtered.map((e) => (
              <tr key={e.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-6 py-4 text-xs font-mono text-slate-500">{e.code}</td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-800">{e.cours}</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full">{e.session}</span>
                </td>
                <td className="px-6 py-4 font-black text-emerald-600">
                  {e.statut === "ANNULEE" ? <span className="text-slate-400 font-normal">—</span> : `${e.score}%`}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${
                    e.statut === "FINALISEE"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-red-50 text-red-500"
                  }`}>
                    {e.statut === "FINALISEE" ? "Finalisée" : "Annulée"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}