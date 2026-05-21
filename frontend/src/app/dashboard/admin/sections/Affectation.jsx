// src/app/dashboard/admin/affectations/page.jsx
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search, Play, RefreshCw, AlertCircle, CheckCircle2, X,
  BookOpen, User, Layers, GraduationCap, ChevronDown, ChevronUp,
  Calendar, Filter
} from "lucide-react";

// ─── Constantes ───────────────────────────────────────────────────────────────

const STATUT = {
  PROPOSEE: { label: "Proposée",   badge: "bg-amber-50 text-amber-700 border-amber-200" },
  AJUSTEE:  { label: "Ajustée",    badge: "bg-blue-50 text-blue-700 border-blue-200" },
  FINALISEE:{ label: "Finalisée",  badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

const SESSIONS_DISPONIBLES = [
  { id: "A2026", nom: "Automne 2026" },
  { id: "H2027", nom: "Hiver 2027" },
];

// ─── Sous-composants ──────────────────────────────────────────────────────────

function StatusBadge({ statut }) {
  const s = STATUT[statut] ?? STATUT.PROPOSEE;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${s.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${statut === "FINALISEE" ? "bg-emerald-500" : statut === "AJUSTEE" ? "bg-blue-500" : "bg-amber-500"}`} />
      {s.label}
    </span>
  );
}

// Ligne d'une proposition
function PropositionRow({ proposition, onAction }) {
  const { id, cours, professeur, programme, statut, sessionNom } = proposition;

  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <td className="px-5 py-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{cours.nom}</span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">{cours.code}</p>
      </td>
      <td className="px-5 py-3">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-700 dark:text-slate-300">{professeur.prenom} {professeur.nom}</span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">{professeur.email}</p>
      </td>
      <td className="px-5 py-3">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border border-purple-200 bg-purple-50 text-purple-600">
          <Layers className="w-3 h-3" /> {programme}
        </span>
      </td>
      <td className="px-5 py-3">
        <StatusBadge statut={statut} />
      </td>
      <td className="px-5 py-3 text-sm text-slate-600 dark:text-slate-400">{sessionNom}</td>
      <td className="px-5 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          {statut === "PROPOSEE" && (
            <>
              <button
                onClick={() => onAction(id, "ACCEPTER")}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition"
              >
                Accepter
              </button>
              <button
                onClick={() => onAction(id, "REJETER")}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition"
              >
                Rejeter
              </button>
            </>
          )}
          {statut === "AJUSTEE" && (
            <button
              onClick={() => onAction(id, "FINALISER")}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition"
            >
              Finaliser
            </button>
          )}
          {statut === "FINALISEE" && (
            <span className="text-xs text-slate-400 italic">Terminée</span>
          )}
        </div>
      </td>
    </tr>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function AdminAffectationsPage() {
  const [propositions, setPropositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedSession, setSelectedSession] = useState(SESSIONS_DISPONIBLES[0].id);
  const [launching, setLaunching] = useState(false);

  // Simuler le lancement de l'algorithme (mock)
  const handleLaunch = async () => {
    setLaunching(true);
    setError(null);
    try {
      // TODO: remplacer par un vrai appel API
      await new Promise(r => setTimeout(r, 1500));
      // Générer des propositions mockées pour la session sélectionnée
      const mockPropositions = [
        {
          id: 1,
          cours: { code: "420-1A3", nom: "Programmation Web" },
          professeur: { prenom: "Jean", nom: "Dupont", email: "jean.dupont@cegep.qc.ca" },
          programme: "PI",
          sessionNom: selectedSession,
          statut: "PROPOSEE",
        },
        {
          id: 2,
          cours: { code: "420-3C5", nom: "IA Appliquée" },
          professeur: { prenom: "Marie", nom: "Curie", email: "marie.curie@cegep.qc.ca" },
          programme: "IAI",
          sessionNom: selectedSession,
          statut: "PROPOSEE",
        },
        {
          id: 3,
          cours: { code: "420-2B4", nom: "Base de données" },
          professeur: { prenom: "Paul", nom: "Martin", email: "paul.martin@cegep.qc.ca" },
          programme: "PI",
          sessionNom: selectedSession,
          statut: "PROPOSEE",
        },
      ];
      // Ajouter aux propositions existantes (ou remplacer selon le besoin)
      setPropositions(prev => {
        // Remplacer les propositions de la même session
        const others = prev.filter(p => p.sessionNom !== selectedSession);
        return [...others, ...mockPropositions];
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLaunching(false);
    }
  };

  // Actions sur les propositions
  const handleAction = useCallback((id, action) => {
    setPropositions(prev =>
      prev.map(p => {
        if (p.id !== id) return p;
        switch (action) {
          case "ACCEPTER":
            return { ...p, statut: "AJUSTEE" };
          case "REJETER":
            return null; // sera filtré
          case "FINALISER":
            return { ...p, statut: "FINALISEE" };
          default:
            return p;
        }
      }).filter(Boolean)
    );
  }, []);

  // Filtrer par recherche et par session (optionnel)
  const filteredPropositions = propositions.filter(p => {
    const q = search.toLowerCase();
    return !q || p.cours.nom.toLowerCase().includes(q) || p.cours.code.toLowerCase().includes(q) || p.professeur.nom.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* ── En-tête ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 px-8 py-8">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
        <div className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 rounded-full bg-gradient-to-br from-emerald-500/20 to-blue-500/20 blur-3xl" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap className="w-5 h-5 text-emerald-400" />
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-emerald-400">Administration</p>
            </div>
            <h1 className="text-3xl font-bold text-white">Affectations</h1>
            <p className="text-sm text-slate-400 mt-2 font-light">
              Lancez l'algorithme et gérez les propositions pour chaque session
            </p>
          </div>
        </div>
      </div>

      {/* ── Lancement de l'algorithme ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-4">Lancer l'algorithme d'affectation</h2>
        <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Session</label>
            <select
              value={selectedSession}
              onChange={e => setSelectedSession(e.target.value)}
              className="px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              {SESSIONS_DISPONIBLES.map(s => (
                <option key={s.id} value={s.id}>{s.nom}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleLaunch}
            disabled={launching}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {launching ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {launching ? "Lancement..." : "Lancer l'algorithme"}
          </button>
        </div>
      </div>

      {/* ── Filtre et recherche ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par cours, professeur..."
            className="w-full pl-11 pr-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500"
          />
        </div>
      </div>

      {/* ── Liste des propositions ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Cours</th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Professeur</th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Programme</th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Statut</th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Session</th>
                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPropositions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <Play className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Aucune proposition pour le moment. Lancez l'algorithme.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredPropositions.map(p => (
                  <PropositionRow key={p.id} proposition={p} onAction={handleAction} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}