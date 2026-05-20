"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, RefreshCw, AlertCircle, BookOpen, Calendar, Layers, GraduationCap, CheckCircle2 } from "lucide-react";
import { StatCell } from "@/components/ui/StatCell";
import { SessionCard } from "../components/Affectation/SessionCard";
import { useCvs } from "@/hooks/useProfessor";

export default function AffectationSection() {
 const [sessions, setSessions] = useState([]);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  //const { affectations: sessions, isLoadingAffectations: loading, affectationsError: error, fetchAffectations } = useCvs();


  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await new Promise(r => setTimeout(r, 600));
      setSessions([
        {
          id: "s1", nom: "A2026", annee: 2026, periode: "AUTOMNE", statut: "ACTIVE",
          dateDebut: "2026-09-01", dateFin: "2026-12-18",
          cours: [
            { code: "420-1A3", nom: "Programmation Web", programme: "PI", etape: 1, statut: "FINALISEE" },
            { code: "420-2B4", nom: "Base de données", programme: "PI", etape: 2, statut: "FINALISEE" },
            { code: "420-3C5", nom: "IA Appliquée", programme: "IAI", etape: 3, statut: "AJUSTEE" },
          ],
        },
        {
          id: "s2", nom: "H2026", annee: 2026, periode: "HIVER", statut: "ARCHIVEE",
          dateDebut: "2026-01-15", dateFin: "2026-04-30",
          cours: [
            { code: "420-1A3", nom: "Programmation Web", programme: "PI", etape: 1, statut: "FINALISEE" },
            { code: "420-4E7", nom: "Réseaux Informatiques", programme: "PI", etape: 4, statut: "FINALISEE" },
          ],
        },
        {
          id: "s3", nom: "A2025", annee: 2025, periode: "AUTOMNE", statut: "ARCHIVEE",
          dateDebut: "2025-09-01", dateFin: "2025-12-18",
          cours: [
            { code: "420-1A3", nom: "Programmation Web", programme: "PI", etape: 1, statut: "AJUSTEE" },
            { code: "420-4E7", nom: "Réseaux Informatiques", programme: "PI", etape: 4, statut: "FINALISEE" },
          ],
        },
      ]);
    } catch (err) {
      setError(err.message || "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const toggle = id => setExpanded(prev => prev === id ? null : id);

  const filtered = sessions
    .map(s => ({
      ...s,
      cours: s.cours.filter(c => {
        const q = search.toLowerCase();
        return !q || c.nom.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.programme.toLowerCase().includes(q);
      }),
    }))
    .filter(s => s.cours.length > 0 || !search);

  const allCours = filtered.flatMap(s => s.cours);
  const nbFinalise = allCours.filter(c => c.statut === "FINALISEE").length;
  const nbProgs = new Set(allCours.map(c => c.programme)).size;

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 px-8 py-8">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
        <div className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 rounded-full bg-gradient-to-br from-emerald-500/20 to-blue-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 blur-3xl" />
        
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap className="w-5 h-5 text-emerald-400" />
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-emerald-400">Enseignement</p>
            </div>
            <h1 className="text-3xl font-bold text-white">Historique</h1>
            <p className="text-sm text-slate-400 mt-2 font-light">
              Consultez l'ensemble de vos affectations par session
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/10 rounded-xl text-sm text-white/80 backdrop-blur-sm">
              <Calendar className="w-4 h-4" /> 
              {sessions.length} session{sessions.length > 1 ? "s" : ""}
            </span>
            <button
              onClick={fetchHistory}
              disabled={loading}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center transition-all backdrop-blur-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {!loading && !error && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCell icon={Calendar} label="Sessions" value={filtered.length} />
          <StatCell icon={BookOpen} label="Cours total" value={allCours.length} />
          <StatCell icon={CheckCircle2} label="Finalisés" value={nbFinalise} />
          <StatCell icon={Layers} label="Programmes" value={nbProgs} />
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher par cours, code ou programme…"
          className="w-full pl-11 pr-4 py-3 text-sm border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500"
        />
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <RefreshCw className="w-6 h-6 text-emerald-500 animate-spin" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Chargement de l'historique...</p>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>
          <button
            onClick={fetchHistory}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 rounded-xl text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Réessayer
          </button>
        </div>
      )}

      {!loading && !error && (
        filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map(s => (
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
            <Search className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {search ? "Aucun résultat pour cette recherche" : "Aucune session disponible"}
            </p>
          </div>
        )
      )}
    </div>
  );
}