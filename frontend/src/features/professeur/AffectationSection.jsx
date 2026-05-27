"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, RefreshCw, AlertCircle } from "lucide-react";
import { SessionCard } from "@/components/professeur/affectation/SessionCard";
import { HistoryHeader } from "@/components/professeur/affectation/HistoryHeader";
import { HistoryStats } from "@/components/professeur/affectation/HistoryStats";
import { useCvs } from "@/hooks/useProfessor";
import { normalizeAssignmentsProf } from "@/lib/formatData";

export default function AffectationSection() {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);
  const { affectations, isLoadingAffectations: loading, affectationsError: error, fetchAffectations } = useCvs();

  const sessions = useMemo(() => normalizeAssignmentsProf(affectations ?? []), [affectations]);

  useEffect(() => { fetchAffectations(); }, [fetchAffectations]);

  const toggle = (id) => setExpanded((prev) => (prev === id ? null : id));

  const filtered = useMemo(() => sessions
    .map((s) => ({
      ...s,
      cours: s.cours.filter((c) => {
        const q = search.toLowerCase();
        return !q || c.nom.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.programme.toLowerCase().includes(q);
      }),
    }))
    .filter((s) => s.cours.length > 0 || !search),
  [sessions, search]);

  const allCours   = filtered.flatMap((s) => s.cours);
  const nbFinalise = allCours.filter((c) => c.statut === "FINALISEE").length;
  const nbProgs    = new Set(allCours.map((c) => c.programme)).size;

  return (
    <div className="space-y-6">
      <HistoryHeader totalSessions={sessions.length} onRefresh={fetchAffectations} loading={loading} />

      {!loading && !error && (
        <HistoryStats
          nbSessions={filtered.length}
          nbCours={allCours.length}
          nbFinalise={nbFinalise}
          nbProgs={nbProgs}
        />
      )}

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par cours, code ou programme…"
          className="w-full pl-11 pr-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition bg-white"
        />
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <RefreshCw className="w-6 h-6 text-emerald-500 animate-spin" />
          <p className="text-sm text-slate-500">Chargement de l&apos;historique...</p>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-red-700">{error?.message ?? "Erreur de chargement"}</p>
          <button
            onClick={fetchAffectations}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-xl text-sm font-medium hover:bg-red-200 transition"
          >
            <RefreshCw className="w-4 h-4" /> Réessayer
          </button>
        </div>
      )}

      {!loading && !error && (
        filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((s) => (
              <SessionCard
                key={s.id}
                session={s}
                isOpen={expanded === s.id}
                onToggle={() => toggle(s.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-sm text-slate-500">
              {search ? "Aucun résultat pour cette recherche" : "Aucune session disponible"}
            </p>
          </div>
        )
      )}
    </div>
  );
}
