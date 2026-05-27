import { BookOpen, Filter, RefreshCw, AlertCircle } from "lucide-react";
import ProposalRow from "./ProposalRow";

/**
 * Tableau des propositions d'affectation.
 * Gère les états : chargement, erreur, vide, résultats filtrés.
 */
export default function ProposalTable({
  proposals,
  filtered,
  loading,
  error,
  onRetry,
  expandedId,
  onToggleExpand,
  onAction,
  onResetFilters,
  weights,
}) {
  // ── États alternatifs ──────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <RefreshCw className="w-7 h-7 text-emerald-500 animate-spin" />
          </div>
          <div className="absolute inset-0 rounded-full border-4 border-emerald-200 dark:border-emerald-800 border-t-emerald-500 animate-spin" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Analyse des profils en cours…
          </p>
          <p className="text-xs text-slate-400 mt-1">
            L&apos;algorithme calcule les scores de compatibilité
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>
            <button
              onClick={onRetry}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 rounded-lg text-xs font-medium hover:bg-red-200 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (proposals.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-14 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-7 h-7 text-slate-400" />
        </div>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Aucune proposition générée
        </h3>
        <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto">
          Sélectionnez une session et un programme, puis cliquez sur &quot;Lancer l&apos;algorithme&quot;.
        </p>
      </div>
    );
  }

  // ── Tableau ────────────────────────────────────────────────────────────────
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full" role="table">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30">
              {["Cours", "Professeur", "Score", "Statut", "Actions"].map((h, i) => (
                <th
                  key={h}
                  className={`px-5 py-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500 ${
                    i === 4 ? "text-right" : "text-left"
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center">
                  <Filter className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">Aucune proposition ne correspond aux filtres</p>
                  <button
                    onClick={onResetFilters}
                    className="mt-3 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Réinitialiser les filtres
                  </button>
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <ProposalRow
                  key={p.id}
                  proposal={p}
                  onAction={onAction}
                  isExpanded={expandedId === p.id}
                  onToggle={() => onToggleExpand(p.id)}
                  weights={weights}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {filtered.length > 0 && (
        <div className="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/20 text-xs text-slate-500">
          {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
          {proposals.length !== filtered.length && ` sur ${proposals.length}`}
          {" "}· Cliquez sur une ligne pour voir le détail du score
        </div>
      )}
    </div>
  );
}
