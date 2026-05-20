/**
 * @module professeur/sections/HistorySection
 * @description Historique des affectations par session pour le professeur.
 */

"use client";

import { useState, useEffect } from "react";
import { History, Search, ChevronDown, ChevronUp, RefreshCw, AlertCircle } from "lucide-react";

// ─── Constantes de style ─────────────────────────────────────────────────────
const STATUT_STYLE = {
  FINALISEE: { bg: "bg-emerald-50", text: "text-emerald-600", label: "Finalisée" },
  AJUSTEE:   { bg: "bg-blue-50",    text: "text-blue-600",    label: "Ajustée"   },
  PROPOSEE:  { bg: "bg-amber-50",   text: "text-amber-600",   label: "Proposée"  },
};

// ─── Sous-composant : une ligne de cours ──────────────────────────────────────
function CourseRow({ code, nom, programme, score, statut }) {
  const s = STATUT_STYLE[statut] || STATUT_STYLE.PROPOSEE;
  return (
    <tr className="hover:bg-slate-50/80 transition-colors">
      <td className="px-6 py-3 text-xs font-mono text-slate-500">{code}</td>
      <td className="px-6 py-3 text-sm font-semibold text-gray-800">{nom}</td>
      <td className="px-6 py-3">
        <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full">{programme}</span>
      </td>
      <td className="px-6 py-3 font-black text-emerald-600 text-sm">{score}%</td>
      <td className="px-6 py-3">
        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${s.bg} ${s.text}`}>{s.label}</span>
      </td>
    </tr>
  );
}

// ─── Sous-composant : carte d'une session (accordéon) ─────────────────────────
function SessionCard({ session, isExpanded, onToggle }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50/60 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[hsl(134,35%,45%)]/10 flex items-center justify-center">
            <History className="w-4 h-4 text-[hsl(134,35%,45%)]" />
          </div>
          <div className="text-left">
            <p className="font-bold text-gray-800 text-sm">{session.label}</p>
            <p className="text-xs text-slate-400">{session.cours.length} cours</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-slate-100">
          <table className="w-full">
            <thead className="bg-slate-50/50">
              <tr>
                {["Code", "Cours", "Programme", "Score", "Statut"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-[11px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {session.cours.map((c) => (
                <CourseRow key={c.code} {...c} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function HistorySection() {
  const [sessions, setSessions] = useState([]);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null); // id de la session ouverte (ou null)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simule un appel API pour récupérer l'historique
  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      // Remplacez l'URL ci-dessous par votre endpoint réel
      // const response = await fetch("/api/professeur/historique");
      // const data = await response.json();
      // setSessions(data);
      
      // Données mockées pour la démonstration
      await new Promise((resolve) => setTimeout(resolve, 600));
      const mockData = [
        {
          id: "1",
          label: "Automne 2026",
          annee: "2026",
          cours: [
            { code: "420-1A3", nom: "Programmation Web", programme: "PI", score: 92, statut: "FINALISEE" },
            { code: "420-2B4", nom: "Base de données", programme: "PI", score: 85, statut: "FINALISEE" },
            { code: "420-3C5", nom: "IA Appliquée", programme: "IAI", score: 84, statut: "AJUSTEE" },
          ],
        },
        {
          id: "2",
          label: "Hiver 2026",
          annee: "2026",
          cours: [
            { code: "420-1A3", nom: "Programmation Web", programme: "PI", score: 88, statut: "FINALISEE" },
            { code: "420-4E7", nom: "Réseaux Informatiques", programme: "PI", score: 76, statut: "FINALISEE" },
          ],
        },
        {
          id: "3",
          label: "Automne 2025",
          annee: "2025",
          cours: [
            { code: "420-2B4", nom: "Base de données", programme: "PI", score: 81, statut: "FINALISEE" },
          ],
        },
      ];
      setSessions(mockData);
    } catch (err) {
      setError(err.message || "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const toggle = (id) => setExpanded((prev) => (prev === id ? null : id));

  // Filtrer les sessions selon la recherche
  const filtered = sessions
    .map((s) => ({
      ...s,
      cours: s.cours.filter(
        (c) =>
          c.nom.toLowerCase().includes(search.toLowerCase()) ||
          c.code.includes(search)
      ),
    }))
    .filter((s) => s.cours.length > 0 || search === "");

  return (
    <div className="space-y-6">
      {/* ── Bannière ── */}
      <div className="relative overflow-hidden rounded-3xl p-8 shadow-lg bg-linear-to-br from-[hsl(134,35%,45%)] to-[#135d55]">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-10 -left-6 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Historique</h1>
            <p className="text-white/70 text-sm mt-1">Vos affectations par session.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 bg-white/15 text-white rounded-full text-xs font-bold">
              {sessions.length} session{sessions.length > 1 ? "s" : ""}
            </span>
            <button
              onClick={fetchHistory}
              disabled={loading}
              className="p-1.5 bg-white/15 hover:bg-white/25 rounded-full text-white transition"
              title="Actualiser"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Barre de recherche ── */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un cours…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(134,35%,45%)] transition"
          />
        </div>
      </div>

      {/* ── Affichage selon état ── */}
      {loading && (
        <div className="flex justify-center py-20">
          <RefreshCw className="w-6 h-6 text-[hsl(134,35%,45%)] animate-spin" />
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
          <p className="text-red-700 font-semibold">{error}</p>
          <button
            onClick={fetchHistory}
            className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition text-sm font-semibold"
          >
            Réessayer
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          {filtered.length > 0 ? (
            <div className="space-y-3">
              {filtered.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  isExpanded={expanded === session.id}
                  onToggle={() => toggle(session.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400 text-sm">
              {search ? "Aucun résultat trouvé." : "Aucune session disponible."}
            </div>
          )}
        </>
      )}
    </div>
  );
}