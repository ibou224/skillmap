/**
 * @module components/professeur/affectation/HistoryHeader
 * @description En-tête de la page d'historique d'enseignement (professeur).
 */

import { GraduationCap, Calendar, RefreshCw } from "lucide-react";

/**
 * En-tête de l'historique des affectations du professeur.
 * @param {Object} props
 * @param {number} props.totalSessions - Nombre de sessions affichées.
 * @param {Function} props.onRefresh - Recharge l'historique.
 * @param {boolean} props.loading - Indicateur de rechargement.
 * @returns {JSX.Element} L'en-tête.
 */
export function HistoryHeader({ totalSessions, onRefresh, loading }) {
  return (
    <div className="relative overflow-hidden rounded-3xl p-8 shadow-lg bg-linear-to-br from-[hsl(134,35%,45%)] to-[#135d55]">
      <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10 pointer-events-none" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap className="w-5 h-5 text-white/70" />
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-white/70">Enseignement</p>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Historique</h1>
          <p className="text-sm text-white/70 mt-1">
            Consultez l&apos;ensemble de vos affectations par session
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-xs font-bold text-white">
            <Calendar className="w-4 h-4" />
            {totalSessions} session{totalSessions > 1 ? "s" : ""}
          </span>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-white text-sm font-medium flex items-center gap-2 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </button>
        </div>
      </div>
    </div>
  );
}
