"use client";

import { Users, RefreshCw, Play } from "lucide-react";

export default function AffHeader({ sessionActive, onRefresh, onLancer, loading, launching }) {
  return (
    <div className="relative overflow-hidden rounded-3xl p-8 shadow-lg bg-linear-to-br from-[hsl(134,35%,45%)] to-[#135d55]">
      <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10 pointer-events-none" />
      <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-white/70" />
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-white/70">RH</p>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Affectations</h1>
          <p className="text-white/70 text-sm mt-1">Suivi des affectations par session</p>
        </div>
        <div className="flex items-center gap-3">
          {sessionActive && (
            <span className="px-4 py-2 rounded-full text-xs font-bold bg-white/20 text-white">
              {sessionActive.nom} — Active
            </span>
          )}
          <button
            onClick={onLancer}
            disabled={launching || !sessionActive}
            className="px-4 py-2 bg-white text-[hsl(134,35%,45%)] hover:bg-white/90 rounded-xl text-sm font-bold flex items-center gap-2 transition disabled:opacity-50"
          >
            <Play size={14} className={launching ? "animate-spin" : ""} />
            {launching ? "Calcul en cours..." : "Lancer l'affectation"}
          </button>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-white text-sm font-medium flex items-center gap-2 transition disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Actualiser
          </button>
        </div>
      </div>
    </div>
  );
}