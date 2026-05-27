"use client";

import { Filter, Search, X } from "lucide-react";

const STATUTS = [
  { value: "PROPOSEE", label: "Proposee" },
  { value: "AJUSTEE", label: "Ajustee" },
  { value: "FINALISEE", label: "Finalisee" },
];

export default function HistoryToolbar({
  search,
  onSearchChange,
  statut,
  onStatutChange,
  onReset,
}) {
  const hasFilters = search || statut;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Rechercher par cours, code, programme, professeur..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white text-slate-700 placeholder-slate-400 transition"
          />
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={statut}
              onChange={(event) => onStatutChange(event.target.value)}
              className="pl-9 pr-8 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 appearance-none"
            >
              <option value="">Tous les statuts</option>
              {STATUTS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {hasFilters && (
            <button
              onClick={onReset}
              className="px-3 py-2 text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 rounded-xl hover:bg-slate-100 transition"
            >
              <X className="w-4 h-4" />
              Effacer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
