import { Search } from "lucide-react";
import { STATUT } from "@/constants/constantes";

export default function AffSearchBar({ search, onSearch, filterStatut, onFilter }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Rechercher par cours, professeur…"
          className="w-full pl-11 pr-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-cite-green transition bg-white"
        />
      </div>
      <select
        value={filterStatut}
        onChange={(e) => onFilter(e.target.value)}
        className="py-3 px-4 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
      >
        <option value="">Tous les statuts</option>
        {Object.entries(STATUT).map(([k, s]) => (
          <option key={k} value={k}>{s.label}</option>
        ))}
      </select>
    </div>
  );
}
