"use client";

/**
 * @module components/skills/SkillsTable
 * @description Tableau paginé des compétences avec actions d'édition/suppression.
 */

import { Lightbulb, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Tableau paginé des compétences.
 * @param {Object} props
 * @param {Array<Object>} props.paginatedSkills - Compétences de la page courante.
 * @param {boolean} props.isLoading - Chargement en cours.
 * @param {string} props.search - Recherche courante (pour l'état vide).
 * @param {number} props.filteredCount - Nombre total après filtrage.
 * @param {number} props.currentPage - Page courante.
 * @param {number} props.totalPages - Nombre total de pages.
 * @param {Function} props.setPage - Callback de changement de page.
 * @returns {JSX.Element} Le tableau des compétences.
 */
export function SkillsTable({
  paginatedSkills,
  isLoading,
  search,
  filteredCount,
  currentPage,
  totalPages,
  setPage,
  onOpenEdit,
  onOpenDelete,
}) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm py-16 text-center text-sm text-slate-400">
        Chargement…
      </div>
    );
  }

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
    .reduce((acc, p, i, arr) => {
      if (i > 0 && p - arr[i - 1] > 1) acc.push("…");
      acc.push(p);
      return acc;
    }, []);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Compétence</th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Programme</th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Description</th>
                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedSkills.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-14 text-center">
                    <Lightbulb className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">
                      {search
                        ? "Aucune compétence ne correspond à la recherche."
                        : "Aucune compétence enregistrée. Commencez par en ajouter une."}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedSkills.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-[hsl(134,35%,45%)] shrink-0" />
                        <span className="text-sm font-medium text-slate-700">{s.nom}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        {s.categorie}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-500 max-w-xs">
                      <span className="line-clamp-2">
                        {s.description || <span className="text-slate-300 italic">—</span>}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenEdit(s)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
                          title="Modifier"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onOpenDelete(s.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-slate-400">
            {filteredCount} compétences — page {currentPage} / {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-4 h-4 text-slate-500" />
            </button>
            {pageNumbers.map((p, i) =>
              p === "…" ? (
                <span key={`e-${i}`} className="px-1 text-slate-400 text-xs">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded-lg text-xs font-semibold transition ${
                    p === currentPage
                      ? "bg-[hsl(134,35%,45%)] text-white"
                      : "hover:bg-slate-100 text-slate-500"
                  }`}
                >
                  {p}
                </button>
              )
            )}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-40 transition"
            >
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}