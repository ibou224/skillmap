/**
 * @module components/users/userToolbar
 * @description Barre d'outils des utilisateurs : recherche, filtre par rôle et ajout.
 */

import { Search, Plus } from "lucide-react";

/**
 * Barre d'outils de la liste des utilisateurs.
 * @param {Object} props
 * @param {string} props.search - Texte de recherche.
 * @param {Function} props.onSearchChange - Callback de changement de recherche.
 * @param {string} props.filterRole - Rôle filtré.
 * @param {Function} props.onFilterChange - Callback de changement de filtre.
 * @param {Function} props.onAdd - Ouvre le formulaire d'ajout.
 * @returns {JSX.Element} La barre d'outils.
 */
export function UserToolbar({ search, onSearchChange, filterRole, onFilterChange, onAdd }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          placeholder="Rechercher un utilisateur…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(134,35%,45%)] transition"
        />
      </div>
      <select
        value={filterRole}
        onChange={(e) => onFilterChange(e.target.value)}
        className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(134,35%,45%)] transition bg-white"
      >
        <option value="tous">Tous les rôles</option>
        <option value="admin">Admin</option>
        <option value="rh">RH</option>
        <option value="professeur">Professeur</option>
      </select>
      <button
        onClick={onAdd}
        className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-[hsl(134,35%,45%)] rounded-xl hover:bg-[hsl(134,35%,35%)] transition"
      >
        <Plus className="w-4 h-4" /> Ajouter
      </button>
    </div>
  );
}