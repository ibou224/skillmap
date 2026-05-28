"use client";

import { useState } from "react";
import { Scale, Pencil, Check, X } from "lucide-react";

const INITIAL = [
  { id:"1", code:"420-1A3", cours:"Programmation Web", theorie:30, pratique:40, projet:30, statut:"VALIDE"   },
  { id:"2", code:"420-2B4", cours:"Base de données",   theorie:40, pratique:35, projet:25, statut:"VALIDE"   },
  { id:"3", code:"420-3C5", cours:"IA Appliquée",      theorie:25, pratique:45, projet:30, statut:"REVISION" },
  { id:"4", code:"420-1D6", cours:"Algorithmique",     theorie:35, pratique:40, projet:25, statut:"VALIDE"   },
];

const STATUT_STYLE = {
  VALIDE:   { bg: "bg-emerald-50", text: "text-emerald-600", label: "Validé"      },
  REVISION: { bg: "bg-amber-50",   text: "text-amber-600",   label: "En révision" },
  MODIFIE:  { bg: "bg-blue-50",    text: "text-blue-600",    label: "Modifié"     },
};

function Bar({ value, color }) {
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
      <span className="text-xs font-bold text-slate-600 w-7 text-right">{value}%</span>
    </div>
  );
}

export default function WeightsSection() {
  const [items, setItems]   = useState(INITIAL);
  const [editId, setEditId] = useState(null);
  const [draft, setDraft]   = useState({ theorie: 0, pratique: 0, projet: 0 });

  const openEdit = (w) => {
    setEditId(w.id);
    setDraft({ theorie: w.theorie, pratique: w.pratique, projet: w.projet });
  };

  const total = draft.theorie + draft.pratique + draft.projet;
  const isValid = total === 100;

  const confirm = (id) => {
    setItems((prev) => prev.map((w) =>
      w.id === id ? { ...w, ...draft, statut: "MODIFIE" } : w
    ));
    setEditId(null);
  };

  const valider = (id) =>
    setItems((prev) => prev.map((w) => w.id === id ? { ...w, statut: "VALIDE" } : w));

  const colors = { theorie: "bg-blue-400", pratique: "bg-emerald-400", projet: "bg-violet-400" };
  const labels = { theorie: "Théorie", pratique: "Pratique", projet: "Projet" };

  return (
    <div className="space-y-6">

      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl p-8 shadow-lg bg-gradient-to-br from-[hsl(134,35%,45%)] to-[#135d55]">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Pondérations</h1>
            <p className="text-white/70 text-sm mt-1">Répartition théorie / pratique / projet</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/15 text-white rounded-full text-xs font-bold">
            <Scale className="w-3.5 h-3.5" />
            {items.length} cours
          </div>
        </div>
      </div>

      {/* Cartes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((w) => {
          const s = STATUT_STYLE[w.statut];
          const isEditing = editId === w.id;

          return (
            <div key={w.id} className={`bg-white rounded-2xl border shadow-sm p-5 transition-all ${isEditing ? "border-[hsl(134,35%,45%)] shadow-md" : "border-slate-100"}`}>

              {/* En-tête */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-black text-gray-800">{w.cours}</p>
                  <p className="text-xs font-mono text-slate-400 mt-0.5">{w.code}</p>
                </div>
                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${s.bg} ${s.text}`}>{s.label}</span>
              </div>

              {/* Barres / Inputs */}
              <div className="space-y-3">
                {["theorie", "pratique", "projet"].map((key) => (
                  <div key={key}>
                    <p className="text-[11px] text-slate-400 mb-1">{labels[key]}</p>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number" min={0} max={100}
                          value={draft[key]}
                          onChange={(e) => setDraft((d) => ({ ...d, [key]: Number(e.target.value) }))}
                          className="w-16 px-2 py-1 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[hsl(134,35%,45%)] text-center font-bold"
                        />
                        <span className="text-xs text-slate-400">%</span>
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${colors[key]}`} style={{ width: `${Math.min(draft[key], 100)}%` }} />
                        </div>
                      </div>
                    ) : (
                      <Bar value={w[key]} color={colors[key]} />
                    )}
                  </div>
                ))}
              </div>

              {/* Total + actions */}
              {isEditing ? (
                <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
                  <span className={`text-xs font-bold ${isValid ? "text-emerald-600" : "text-red-500"}`}>
                    Total : {total}% {!isValid && "— doit être égal à 100%"}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => confirm(w.id)}
                      disabled={!isValid}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditId(null)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Total : {w.theorie + w.pratique + w.projet}%</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(w)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors"
                      title="Modifier"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    {w.statut !== "VALIDE" && (
                      <button
                        onClick={() => valider(w.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                        title="Valider"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
}