"use client";

import { Search, X } from "lucide-react";

export default function HistoryToolbar({ search, onSearchChange, onReset }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Rechercher par cours, code, programme, professeur…"
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white text-slate-700 placeholder-slate-400 transition"
          />
        </div>

        {search && (
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
  );
}
