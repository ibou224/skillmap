// src/app/dashboard/admin/affectations/page.jsx
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search, Play, RefreshCw, AlertCircle, CheckCircle2,
  BookOpen, User, Layers, GraduationCap,
} from "lucide-react";
import { useSessions } from "@/hooks/useSessions";

// ─── Constantes ────────────────────────────────────────────────────────────────

const STATUT = {
  PROPOSEE:  { label: "Proposée",  badge: "bg-amber-50 text-amber-700 border-amber-200" },
  AJUSTEE:   { label: "Ajustée",   badge: "bg-blue-50 text-blue-700 border-blue-200" },
  FINALISEE: { label: "Finalisée", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

// ─── Sous-composants ───────────────────────────────────────────────────────────

function StatusBadge({ statut }) {
  const s = STATUT[statut] ?? STATUT.PROPOSEE;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${s.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${statut === "FINALISEE" ? "bg-emerald-500" : statut === "AJUSTEE" ? "bg-blue-500" : "bg-amber-500"}`} />
      {s.label}
    </span>
  );
}

function PropositionRow({ proposition, onAction }) {
  const { id, cours, professeur, statut, score } = proposition;
  const programme = cours.programmes?.[0]?.code ?? "—";

  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-5 py-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-700">{cours.nom}</span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">{cours.code}</p>
      </td>
      <td className="px-5 py-3">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-700">{professeur.prenom} {professeur.nom}</span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">{professeur.email}</p>
      </td>
      <td className="px-5 py-3">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border border-purple-200 bg-purple-50 text-purple-600">
          <Layers className="w-3 h-3" /> {programme}
        </span>
      </td>
      <td className="px-5 py-3 text-sm text-slate-600 font-semibold">
        {score != null ? `${Math.round(score * 100)} %` : "—"}
      </td>
      <td className="px-5 py-3">
        <StatusBadge statut={statut} />
      </td>
      <td className="px-5 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          {statut === "PROPOSEE" && (
            <button
              onClick={() => onAction(id, "AJUSTEE")}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition"
            >
              Accepter
            </button>
          )}
          {statut === "AJUSTEE" && (
            <button
              onClick={() => onAction(id, "FINALISEE")}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition"
            >
              Finaliser
            </button>
          )}
          {statut === "FINALISEE" && (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          )}
        </div>
      </td>
    </tr>
  );
}

// ─── Page principale ───────────────────────────────────────────────────────────

export default function AdminAffectationsPage() {
  const { sessions, fetchSessions, isLoading: loadingSessions } = useSessions();

  const [affectations, setAffectations]   = useState([]);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState(null);
  const [search, setSearch]               = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [launching, setLaunching]         = useState(false);
  const [successMsg, setSuccessMsg]       = useState("");

  // Charger les sessions au montage
  useEffect(() => { fetchSessions({ limit: 100 }); }, [fetchSessions]);

  // Sélectionner la première session dès qu'elles sont chargées
  useEffect(() => {
    if (sessions.length > 0 && !selectedSessionId) {
      setSelectedSessionId(sessions[0].id);
    }
  }, [sessions, selectedSessionId]);

  // Charger les affectations quand la session change
  const fetchAffectations = useCallback(async (sessionId) => {
    if (!sessionId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/affectations?sessionId=${sessionId}`);
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const { data } = await res.json();
      setAffectations(data ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAffectations(selectedSessionId);
  }, [selectedSessionId, fetchAffectations]);

  // Lancer l'algorithme d'affectation
  const handleLaunch = async () => {
    if (!selectedSessionId) return;
    setLaunching(true);
    setError(null);
    try {
      const res = await fetch("/api/affectations/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: selectedSessionId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || `Erreur ${res.status}`);
      setAffectations(json.data ?? []);
      setSuccessMsg(json.message ?? "Affectations générées.");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLaunching(false);
    }
  };

  // Changer le statut d'une affectation
  const handleAction = useCallback(async (id, newStatut) => {
    try {
      const res = await fetch(`/api/affectations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut: newStatut }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || "Erreur");
      }
      setAffectations((prev) =>
        prev.map((a) => (a.id === id ? { ...a, statut: newStatut } : a))
      );
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const filtered = affectations.filter((p) => {
    const q = search.toLowerCase();
    return !q
      || p.cours.nom.toLowerCase().includes(q)
      || p.cours.code.toLowerCase().includes(q)
      || p.professeur.nom.toLowerCase().includes(q);
  });

  const selectedSession = sessions.find((s) => s.id === selectedSessionId);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-slate-900 to-slate-800 px-8 py-8">
        <div className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 rounded-full bg-linear-to-br from-emerald-500/20 to-blue-500/20 blur-3xl" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap className="w-5 h-5 text-emerald-400" />
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-emerald-400">Administration</p>
            </div>
            <h1 className="text-3xl font-bold text-white">Affectations</h1>
            <p className="text-sm text-slate-400 mt-2 font-light">
              Lancez l&apos;algorithme et gérez les propositions pour chaque session
            </p>
          </div>
        </div>
      </div>

      {/* Alertes */}
      {successMsg && (
        <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-medium">
          <CheckCircle2 className="w-4 h-4" /> {successMsg}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Lancement */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-800 mb-4">Lancer l&apos;algorithme d&apos;affectation</h2>
        <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Session</label>
            <select
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              disabled={loadingSessions}
            >
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>{s.nom} — {s.statut}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleLaunch}
            disabled={launching || !selectedSessionId}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {launching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {launching ? "Lancement..." : "Lancer l'algorithme"}
          </button>
          <button
            onClick={() => fetchAffectations(selectedSessionId)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Actualiser
          </button>
        </div>
      </div>

      {/* Recherche */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par cours, professeur..."
            className="w-full pl-11 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition bg-white"
          />
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span className="text-sm">Chargement…</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Cours</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Professeur</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Programme</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Score</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Statut</th>
                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-14 text-center">
                      <Play className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">
                        {selectedSession
                          ? `Aucune affectation pour la session ${selectedSession.nom}. Lancez l'algorithme.`
                          : "Sélectionnez une session."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => (
                    <PropositionRow key={p.id} proposition={p} onAction={handleAction} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}