"use client";

import { Search, Plus } from "lucide-react";

export function SkillsToolbar({
  search,
  setSearch,
  filterProgramme,
  setFilterProgramme,
  programmes,
  setPage,
  onOpenAdd,
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
      <div className="flex flex-col sm:flex-row gap-2 flex-1">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Rechercher une compétence…"
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(134,35%,45%)]/20 focus:border-[hsl(134,35%,45%)] bg-white transition"
          />
        </div>
        <select
          value={filterProgramme}
          onChange={(e) => {
            setFilterProgramme(e.target.value);
            setPage(1);
          }}
          className="py-2.5 px-3.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(134,35%,45%)]/20 focus:border-[hsl(134,35%,45%)] bg-white text-slate-600"
        >
          <option value="">Tous les programmes</option>
          {programmes.map((p) => (
            <option key={p.id} value={p.nom}>
              {p.nom}
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={onOpenAdd}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-[hsl(134,35%,45%)] text-white text-sm font-semibold rounded-xl hover:bg-[#135d55] transition shadow-sm shrink-0"
      >
        <Plus className="w-4 h-4" /> Ajouter une compétence
      </button>
    </div>
  );
}