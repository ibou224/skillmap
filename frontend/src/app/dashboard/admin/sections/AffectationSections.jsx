"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  Search, Play, RefreshCw, AlertCircle,
  BookOpen, User, Layers, ChevronDown, ChevronUp, Edit3, X,
} from "lucide-react";

// ─── Constantes & Configuration ───────────────────────────────────────────────

const STATUT = {
  FINALISEE: { label: "Finalisée", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  AJUSTEE:   { label: "Ajustée",   badge: "bg-blue-50 text-blue-700 border-blue-200",      dot: "bg-blue-500"    },
  PROPOSEE:  { label: "Proposée",  badge: "bg-amber-50 text-amber-700 border-amber-200",   dot: "bg-amber-500"   },
};

const MOCK_SESSIONS = [
  { id: "s1", nom: "A2026" },
  { id: "s2", nom: "H2026" },
  { id: "s3", nom: "A2025" },
];

const MOCK_PROGRAMS = [
  { id: "p1", code: "PI",  nom: "Programmation informatique" },
  { id: "p2", code: "IAI", nom: "Intelligence artificielle et informatique" },
  { id: "p3", code: "RS",  nom: "Réseaux et sécurité" },
];

const MOCK_COURSES = [
  { id: "c1", code: "420-1A3", nom: "Programmation Web" },
  { id: "c2", code: "420-2B4", nom: "Base de données" },
  { id: "c3", code: "420-3C5", nom: "IA Appliquée" },
  { id: "c4", code: "420-4E7", nom: "Réseaux Informatiques" },
  { id: "c5", code: "420-5F8", nom: "Sécurité Informatique" },
];

const MOCK_PROPOSALS = [
  { id: "1", cours: { id: "c1", code: "420-1A3", nom: "Programmation Web" }, professeur: { prenom: "Jean", nom: "Dupont", email: "jean.dupont@lacitec.on.ca" }, score: 87.5, scoreDetail: { skills: 92, experience: 80, education: 85, history: 100 }, statut: "PROPOSEE" },
  { id: "2", cours: { id: "c3", code: "420-3C5", nom: "IA Appliquée" }, professeur: { prenom: "Marie", nom: "Curie", email: "marie.curie@lacitec.on.ca" }, score: 74.0, scoreDetail: { skills: 80, experience: 65, education: 80, history: 0 }, statut: "AJUSTEE" },
  { id: "3", cours: { id: "c4", code: "420-4E7", nom: "Réseaux Informatiques" }, professeur: { prenom: "Paul", nom: "Martin", email: "paul.martin@lacitec.on.ca" }, score: 58.2, scoreDetail: { skills: 60, experience: 50, education: 60, history: 0 }, statut: "PROPOSEE" },
  { id: "4", cours: { id: "c2", code: "420-2B4", nom: "Base de données" }, professeur: { prenom: "Jean", nom: "Dupont", email: "jean.dupont@lacitec.on.ca" }, score: 91.0, scoreDetail: { skills: 95, experience: 80, education: 85, history: 100 }, statut: "FINALISEE" },
];

// ─── Sous-composants ──────────────────────────────────────────────────────────

const StatusBadge = React.memo(({ statut }) => {
  const s = STATUT[statut] || STATUT.PROPOSEE;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase border ${s.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} animate-pulse`} />
      {s.label}
    </span>
  );
});
StatusBadge.displayName = 'StatusBadge';

function ScoreBar({ score }) {
  const color = score >= 75 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-red-400";
  return (
    <div className="flex items-center gap-3">
      <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
        <div className={`h-full rounded-full ${color} transition-all duration-1000 ease-out`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{score.toFixed(1)}%</span>
    </div>
  );
}

function ScoreDetail({ detail }) {
  const items = [
    { label: "Compétences", value: detail.skills },
    { label: "Expérience",  value: detail.experience },
    { label: "Formation",   value: detail.education },
    { label: "Historique",  value: detail.history },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-5 py-4 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 shadow-inner">
      {items.map(({ label, value }) => (
        <div key={label} className="text-center p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">{label}</p>
          <p className="text-lg font-black text-slate-700 dark:text-slate-200">{value}%</p>
        </div>
      ))}
    </div>
  );
}

function AjustementModal({ isOpen, onClose, onSave, proposal }) {
  const [coursId, setCoursId] = useState("");

  // Réinitialiser le formulaire quand la modale s'ouvre
  useEffect(() => {
    if (proposal) setCoursId(proposal.cours.id);
  }, [proposal]);

  // Accessibilité : fermer avec Echap & bloquer le scroll
  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !proposal) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedCours = MOCK_COURSES.find(c => c.id === coursId);
    if (selectedCours) {
      onSave(proposal.id, selectedCours);
      onClose();
    }
  };

  const inputCls = "w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 shadow-sm";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Ajustement manuel</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 rounded-xl flex items-start gap-3">
            <User className="w-5 h-5 text-emerald-600 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide">Professeur concerné</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">{proposal.professeur.prenom} {proposal.professeur.nom}</p>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="coursSelect" className="block text-sm font-bold text-slate-700 dark:text-slate-300">Nouveau cours à assigner</label>
            <select id="coursSelect" value={coursId} onChange={e => setCoursId(e.target.value)} required className={inputCls}>
              <option value="" disabled>Sélectionnez un cours dans la liste</option>
              {MOCK_COURSES.map(c => (
                <option key={c.id} value={c.id}>{c.code} — {c.nom}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition">
              Annuler
            </button>
            <button type="submit" disabled={!coursId || coursId === proposal.cours.id} className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm">
              Enregistrer l'ajustement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ProposalRow({ proposal, onValider, onFinaliser, onAjuster, expanded, onToggle }) {
  const isFinalisee = proposal.statut === "FINALISEE";

  return (
    <>
      <tr 
        className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group ${expanded ? 'bg-slate-50/50 dark:bg-slate-800/30' : ''}`}
        onClick={onToggle}
      >
        <td className="px-5 py-4 align-top">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:bg-white transition-colors shadow-sm">
              <BookOpen className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200 block leading-tight">{proposal.cours.nom}</span>
              <span className="text-xs text-slate-500 font-medium">{proposal.cours.code}</span>
            </div>
          </div>
        </td>
        <td className="px-5 py-4 align-top">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold text-xs shadow-sm">
              {proposal.professeur.prenom[0]}{proposal.professeur.nom[0]}
            </div>
            <div>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200 block leading-tight">{proposal.professeur.prenom} {proposal.professeur.nom}</span>
              <span className="text-xs text-slate-500">{proposal.professeur.email}</span>
            </div>
          </div>
        </td>
        <td className="px-5 py-4 align-middle">
          <ScoreBar score={proposal.score} />
        </td>
        <td className="px-5 py-4 align-middle">
          <StatusBadge statut={proposal.statut} />
        </td>
        <td className="px-5 py-4 align-middle">
          <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-70 group-hover:opacity-100 transition-opacity">
            {!isFinalisee && (
              <button
                onClick={e => { e.stopPropagation(); onAjuster(proposal); }}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition"
                title="Ajustement manuel"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
            {proposal.statut === "PROPOSEE" && (
              <button
                onClick={e => { e.stopPropagation(); onValider(proposal.id); }}
                className="px-4 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 hover:text-emerald-700 rounded-lg transition shadow-sm"
              >
                Valider
              </button>
            )}
            {proposal.statut === "AJUSTEE" && (
              <button
                onClick={e => { e.stopPropagation(); onFinaliser(proposal.id); }}
                className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition shadow-sm"
              >
                Finaliser
              </button>
            )}
            <div className="w-8 flex justify-center text-slate-400">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={5} className="p-0 border-b border-slate-100 dark:border-slate-800">
            <div className="animate-in slide-in-from-top-2 fade-in duration-200">
              <ScoreDetail detail={proposal.scoreDetail} />
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Composant Principal ──────────────────────────────────────────────────────

export default function AffectationSections() {
  const [selectedSession, setSelectedSession] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [proposals, setProposals] = useState([]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);
  const [editingProposal, setEditingProposal] = useState(null);

  const handleLancerAlgorithme = useCallback(async () => {
    if (!selectedSession || !selectedProgram) return;
    setRunning(true);
    setError(null);
    setProposals([]);
    
    try {
      // Simulation API : Remplacer par fetch('/api/affectations', ...)
      await new Promise(r => setTimeout(r, 1500));
      setProposals(MOCK_PROPOSALS);
    } catch (err) {
      setError("Le calcul des affectations a échoué. Veuillez réessayer.");
    } finally {
      setRunning(false);
    }
  }, [selectedSession, selectedProgram]);

  const handleValider = useCallback((id) => {
    setProposals(prev => prev.map(p => p.id === id ? { ...p, statut: "AJUSTEE" } : p));
  }, []);

  const handleFinaliser = useCallback((id) => {
    setProposals(prev => prev.map(p => p.id === id ? { ...p, statut: "FINALISEE" } : p));
  }, []);

  const handleSaveAjustement = useCallback((id, newCours) => {
    setProposals(prev => prev.map(p =>
      p.id === id ? { ...p, cours: newCours, statut: "AJUSTEE" } : p
    ));
  }, []);

  // OPTIMISATION : Utilisation de useMemo pour éviter de recalculer à chaque render
  const filteredProposals = useMemo(() => {
    return proposals.filter(p => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        p.cours.nom.toLowerCase().includes(q) ||
        p.cours.code.toLowerCase().includes(q) ||
        p.professeur.prenom.toLowerCase().includes(q) ||
        p.professeur.nom.toLowerCase().includes(q);
      const matchStatut = !filterStatut || p.statut === filterStatut;
      return matchSearch && matchStatut;
    });
  }, [proposals, search, filterStatut]);

  const stats = useMemo(() => ({
    total:      proposals.length,
    proposees:  proposals.filter(p => p.statut === "PROPOSEE").length,
    ajustees:   proposals.filter(p => p.statut === "AJUSTEE").length,
    finalisees: proposals.filter(p => p.statut === "FINALISEE").length,
  }), [proposals]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* ── En-tête Hero ── */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-10 sm:px-12 sm:py-12 shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/50 to-slate-900/80" />
        
        <div className="relative flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-300">SkillMap IA Engine</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">Moteur d'Affectations</h1>
            <p className="text-lg text-slate-300 mt-4 font-light leading-relaxed">
              Configurez les paramètres de session pour laisser l'intelligence artificielle générer les meilleures propositions de jumelage entre professeurs et cours.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto shrink-0 bg-white/5 p-2 rounded-2xl backdrop-blur-md border border-white/10">
            <select
              value={selectedSession}
              onChange={e => setSelectedSession(e.target.value)}
              className="w-full sm:w-auto px-4 py-3 text-sm bg-transparent text-white font-medium focus:outline-none [&>option]:text-slate-900 cursor-pointer"
            >
              <option value="" disabled>Sélectionner la session</option>
              {MOCK_SESSIONS.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
            </select>
            <div className="hidden sm:block w-px h-8 bg-white/20" />
            <select
              value={selectedProgram}
              onChange={e => setSelectedProgram(e.target.value)}
              className="w-full sm:w-auto px-4 py-3 text-sm bg-transparent text-white font-medium focus:outline-none [&>option]:text-slate-900 cursor-pointer"
            >
              <option value="" disabled>Sélectionner le programme</option>
              {MOCK_PROGRAMS.map(p => <option key={p.id} value={p.id}>{p.code} — {p.nom}</option>)}
            </select>
            <button
              onClick={handleLancerAlgorithme}
              disabled={!selectedSession || !selectedProgram || running}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-600 disabled:text-slate-400 text-white text-sm font-bold rounded-xl transition-all shadow-lg hover:shadow-emerald-500/25 active:scale-95"
            >
              {running ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
              {running ? "Analyse IA..." : "Lancer"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Compteurs Statistiques ── */}
      {proposals.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {[
            { label: "Total des affectations", value: stats.total, color: "text-slate-800 dark:text-white" },
            { label: "Propositions à valider", value: stats.proposees, color: "text-amber-600" },
            { label: "Ajustements manuels", value: stats.ajustees, color: "text-blue-600" },
            { label: "Affectations finalisées", value: stats.finalisees, color: "text-emerald-600" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <p className={`text-3xl font-black ${color}`}>{value}</p>
              <p className="text-sm font-medium text-slate-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Filtres et Recherche ── */}
      {proposals.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-2 shadow-sm animate-in fade-in duration-500 delay-100">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher par professeur, code de cours, nom..."
                className="w-full pl-12 pr-4 py-3 text-sm border-none bg-transparent focus:outline-none focus:ring-0 text-slate-700 dark:text-slate-300 placeholder-slate-400 font-medium"
              />
            </div>
            <div className="hidden sm:block w-px bg-slate-200 dark:bg-slate-800 my-2" />
            <select
              value={filterStatut}
              onChange={e => setFilterStatut(e.target.value)}
              className="px-4 py-3 text-sm font-medium bg-transparent text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="">Tous les statuts</option>
              {Object.keys(STATUT).map(key => (
                <option key={key} value={key}>{STATUT[key].label}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* ── États de l'interface (Loading, Error, Empty) ── */}
      {running && (
        <div className="flex flex-col items-center justify-center py-32 animate-in fade-in">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-4 border-emerald-100 dark:border-emerald-900/50 rounded-full" />
            <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-emerald-500 animate-pulse" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mt-6">Analyse IA en cours</h3>
          <p className="text-sm text-slate-500 mt-2 max-w-md text-center">Croisement des compétences des professeurs avec les exigences des cours du programme sélectionné...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/10 border-2 border-red-100 dark:border-red-900/30 rounded-3xl p-10 text-center max-w-2xl mx-auto mt-12 animate-in zoom-in-95">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-red-800 dark:text-red-400 mb-2">Erreur système</h3>
          <p className="text-sm font-medium text-red-600 dark:text-red-300/80 mb-6">{error}</p>
          <button onClick={handleLancerAlgorithme} className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-red-700 border border-red-200 rounded-xl text-sm font-bold hover:bg-red-50 transition shadow-sm">
            <RefreshCw className="w-4 h-4" /> Tenter à nouveau
          </button>
        </div>
      )}

      {!running && !error && proposals.length === 0 && (
        <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-16 text-center max-w-3xl mx-auto mt-12">
          <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">Prêt pour l'affectation</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Utilisez le panneau ci-dessus pour sélectionner une session académique et un programme, puis lancez le moteur d'Intelligence Artificielle.
          </p>
        </div>
      )}

      {/* ── Tableau des Résultats ── */}
      {!running && !error && proposals.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50">
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400 w-1/4">Cours Requis</th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400 w-1/4">Professeur Suggéré</th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Score de Compatibilité</th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">État</th>
                  <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredProposals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <Search className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                      <p className="text-base font-semibold text-slate-600 dark:text-slate-300">Aucun résultat trouvé</p>
                      <p className="text-sm text-slate-400 mt-1">Modifiez vos filtres de recherche.</p>
                    </td>
                  </tr>
                ) : (
                  filteredProposals.map(p => (
                    <ProposalRow
                      key={p.id}
                      proposal={p}
                      onValider={handleValider}
                      onFinaliser={handleFinaliser}
                      onAjuster={setEditingProposal}
                      expanded={expandedRow === p.id}
                      onToggle={() => setExpandedRow(prev => prev === p.id ? null : p.id)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Composant de fenêtre modale */}
      <AjustementModal
        isOpen={!!editingProposal}
        onClose={() => setEditingProposal(null)}
        onSave={handleSaveAjustement}
        proposal={editingProposal}
      />
    </div>
  );
}