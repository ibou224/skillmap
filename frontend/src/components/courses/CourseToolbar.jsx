/**
 * @module components/courses/CourseToolbar
 * @description Barre d'outils des cours : recherche, filtres (programme, compétence),
 * bascule actifs/archivés et ajout d'un cours.
 */

import { Search, Plus, Archive } from "lucide-react";

/**
 * Barre d'outils de la liste des cours.
 *
 * @param {Object} props
 * @param {string} props.search - Texte de recherche.
 * @param {Function} props.onSearchChange - Callback de changement de recherche.
 * @param {string} props.filterProgram - Programme filtré.
 * @param {Array<Object>} props.programs - Programmes disponibles.
 * @param {Function} props.onFilterChange - Callback de changement de filtre programme.
 * @param {string} props.filterSkill - Compétence filtrée.
 * @param {Array<Object>} props.skills - Compétences disponibles.
 * @param {Function} props.onFilterSkillChange - Callback de changement de filtre compétence.
 * @param {Function} props.onAdd - Ouvre le formulaire d'ajout.
 * @param {boolean} props.showArchived - Affiche les cours archivés si vrai.
 * @param {Function} props.onToggleArchived - Bascule actifs/archivés.
 * @returns {JSX.Element} La barre d'outils.
 */
export function CourseToolbar({
  search,
  onSearchChange,
  filterProgram,
  programs,
  onFilterChange,
  filterSkill,
  skills,
  onFilterSkillChange,
  onAdd,
  showArchived,
  onToggleArchived,
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          placeholder="Rechercher un cours…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(134,35%,45%)] transition"
        />
      </div>

      <select
        value={filterProgram}
        onChange={(e) => onFilterChange(e.target.value)}
        className="px-3 py-2 text-sm max-w-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(134,35%,45%)] transition bg-white"
      >
        <option value="tous">Tous les programmes</option>
        {programs.map((p) => (
          <option key={p.id} value={p.id}>{p.nom}</option>
        ))}
      </select>

      <select
        value={filterSkill}
        onChange={(e) => onFilterSkillChange(e.target.value)}
        className="px-3 py-2 text-sm border max-w-xs border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(134,35%,45%)] transition bg-white"
      >
        <option value="tous">Toutes les compétences</option>
        {skills.map((s) => (
          <option key={s.id} value={s.id}>{s.nom}</option>
        ))}
      </select>

      <button
        onClick={onToggleArchived}
        className={`flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-xl cursor-pointer transition border ${
          showArchived
            ? "bg-orange-500 text-white border-orange-500 hover:bg-orange-600"
            : "bg-white text-orange-500 border-orange-200 hover:bg-orange-50"
        }`}
      >
        <Archive className="w-4 h-4" />
        {showArchived ? "Actifs" : "Archives"}
      </button>

      <button
        onClick={onAdd}
        className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-[hsl(134,35%,45%)] rounded-xl hover:bg-[hsl(134,35%,35%)] transition"
      >
        <Plus className="w-4 h-4" /> Ajouter
      </button>
    </div>
  );
}
