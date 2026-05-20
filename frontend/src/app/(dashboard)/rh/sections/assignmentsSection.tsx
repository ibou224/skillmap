"use client";

import { useState } from "react";
import { Search, Check, X, SlidersHorizontal } from "lucide-react";

type Statut = "PROPOSEE" | "AJUSTEE" | "FINALISEE" | "REFUSEE";

interface Assignment {
  id: string; code: string; nom: string;
  programme: string; etape: number;
  score: number; statut: Statut;
  professeur: string;
}

const STATUT_STYLE: Record<Statut, { bg: string; text: string; label: string }> = {
  PROPOSEE:  { bg: "bg-amber-50",   text: "text-amber-600",  label: "Proposée"  },
  AJUSTEE:   { bg: "bg-blue-50",    text: "text-blue-600",   label: "Ajustée"   },
  FINALISEE: { bg: "bg-emerald-50", text: "text-emerald-600",label: "Finalisée" },
  REFUSEE:   { bg: "bg-red-50",     text: "text-red-500",    label: "Refusée"   },
};

const INITIAL: Assignment[] = [
  { id:"1", code:"420-1A3", nom:"Programmation Web", programme:"PI",  etape:1, score:92, statut:"FINALISEE", professeur:"Jean Dupont"    },
  { id:"2", code:"420-2B4", nom:"Base de données",   programme:"PI",  etape:2, score:85, statut:"FINALISEE", professeur:"Marie Tremblay"  },
  { id:"3", code:"420-3C5", nom:"IA Appliquée",      programme:"IAI", etape:3, score:84, statut:"PROPOSEE",  professeur:"Luc Bernard"     },
  { id:"4", code:"420-1D6", nom:"Algorithmique",     programme:"PI",  etape:1, score:78, statut:"PROPOSEE",  professeur:"Sara Leclerc"    },
];

export default function AssignmentsSection() {
  const [items, setItems]       = useState<Assignment[]>(INITIAL);
  const [search, setSearch]     = useState("");
  const [adjustId, setAdjustId] = useState<string | null>(null);
  const [newScore, setNewScore] = useState(0);

  const filtered = items.filter(
    (a) => a.nom.toLowerCase().includes(search.toLowerCase()) ||
           a.code.includes(search) ||
           a.professeur.toLowerCase().includes(search.toLowerCase())
  );

  const setStatut = (id: string, statut: Statut) =>
    setItems((prev) => prev.map((a) => a.id === id ? { ...a, statut } : a));

  const openAdjust = (a: Assignment) => { setAdjustId(a.id); setNewScore(a.score); };

  const confirmAdjust = (id: string) => {
    setItems((prev) => prev.map((a) => a.id === id ? { ...a, score: newScore, statut: "AJUSTEE" } : a));
    setAdjustId(null);
  };

  return (
    <div className="space-y-6">

      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl p-8 shadow-lg bg-gradient-to-br from-[hsl(134,35%,45%)] to-[#135d55]">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Affectations</h1>
            <p className="text-white/70 text-sm mt-1">Session active : Automne 2026</p>
          </div>
          <span className="px-3 py-1.5 bg-white/15 text-white rounded-full text-xs font-bold">
            {items.filter(a => a.statut === "PROPOSEE").length} en attente
          </span>
        </div>
      </div>

      {/* Filtre */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un cours ou un professeur…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(134,35%,45%)] transition"
          />
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              {["Code", "Cours", "Professeur", "Programme", "Score", "Statut", "Actions"].map((h) => (
                <th key={h} className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-widest text-slate-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-16 text-slate-400 text-sm">Aucune affectation trouvée.</td></tr>
            ) : filtered.map((a) => {
              const s = STATUT_STYLE[a.statut];
              const isAdjusting = adjustId === a.id;
              return (
                <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 text-xs font-mono text-slate-500">{a.code}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-800">{a.nom}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{a.professeur}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full">{a.programme}</span>
                  </td>
                  <td className="px-6 py-4">
                    {isAdjusting ? (
                      <input
                        type="number" min={0} max={100} value={newScore}
                        onChange={(e) => setNewScore(Number(e.target.value))}
                        className="w-16 px-2 py-1 text-sm border border-[hsl(134,35%,45%)] rounded-lg focus:outline-none text-center font-black text-emerald-600"
                      />
                    ) : (
                      <span className="font-black text-emerald-600">{a.score}%</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${s.bg} ${s.text}`}>{s.label}</span>
                  </td>
                  <td className="px-6 py-4">
                    {isAdjusting ? (
                      <div className="flex items-center gap-2">
                        <button onClick={() => confirmAdjust(a.id)} className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 transition-colors">Confirmer</button>
                        <button onClick={() => setAdjustId(null)} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors">Annuler</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {a.statut !== "FINALISEE" && a.statut !== "REFUSEE" && (
                          <button onClick={() => setStatut(a.id, "FINALISEE")} title="Valider" className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors">
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        {a.statut !== "REFUSEE" && (
                          <button onClick={() => setStatut(a.id, "REFUSEE")} title="Refuser" className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                        {a.statut !== "REFUSEE" && (
                          <button onClick={() => openAdjust(a)} title="Ajuster le score" className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors">
                            <SlidersHorizontal className="w-4 h-4" />
                          </button>
                        )}
                        {a.statut === "REFUSEE" && (
                          <button onClick={() => setStatut(a.id, "PROPOSEE")} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors">Rétablir</button>
                        )}
                      </div>
                    )}
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