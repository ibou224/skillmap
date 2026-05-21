"use client";

import { Search } from "lucide-react";
import { STATUT } from "@/lib/constants-Affectation";

export default function AffectationToolbar({
  search,
  onSearchChange,
  filterStatut,
  onFilterChange,
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Recherche */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Rechercher cours, professeur, compétence…"
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 placeholder-slate-400 transition"
          />
        </div>

        <div className="flex gap-2">
          {/* Filtre statut */}
          <select
            value={filterStatut}
            onChange={(e) => onFilterChange(e.target.value)}
            className="px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="">Tous les statuts</option>
            {Object.entries(STATUT).map(([k, s]) => (
              <option key={k} value={k}>{s.label}</option>
            ))}
          </select>

        </div>
      </div>
    </div>
  );
}
