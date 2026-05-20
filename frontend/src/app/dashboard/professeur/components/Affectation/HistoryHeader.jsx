import { Calendar, RefreshCw, GraduationCap } from "lucide-react";

export default function HistoryHeader({ sessionCount, onRefresh, loading }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 px-8 py-8">
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap className="w-5 h-5 text-emerald-400" />
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-emerald-400">Enseignement</p>
          </div>
          <h1 className="text-3xl font-bold text-white">Historique</h1>
          <p className="text-sm text-slate-400 mt-2 font-light">Consultez l'ensemble de vos affectations par session</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/10 rounded-xl text-sm text-white/80 backdrop-blur-sm">
            <Calendar className="w-4 h-4" /> {sessionCount} session{sessionCount > 1 ? "s" : ""}
          </span>
          <button onClick={onRefresh} disabled={loading} className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center transition-all backdrop-blur-sm disabled:opacity-50" title="Actualiser">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>
    </div>
  );
}