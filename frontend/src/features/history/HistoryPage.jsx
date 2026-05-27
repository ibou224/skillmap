"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, RefreshCw, Search } from "lucide-react";

import HistoryHeader from "./components/HistoryHeader";
import HistorySessionFilter from "./components/HistorySessionFilter";
import HistoryStats from "./components/HistoryStats";
import HistoryToolbar from "./components/HistoryToolbar";
import HistorySessionCard from "./components/HistorySessionCard";

function groupBySession(assignments) {
  const groups = assignments.reduce((acc, assignment) => {
    const id = assignment.session.id;
    if (!acc[id]) {
      acc[id] = { session: assignment.session, assignments: [] };
    }
    acc[id].assignments.push(assignment);
    return acc;
  }, {});

  return Object.values(groups);
}

function matchesSearch(assignment, query) {
  if (!query) return true;
  const q = query.toLowerCase();
  const programs = assignment.course.programs?.map((program) => `${program.code} ${program.nom}`).join(" ") ?? "";

  return [
    assignment.course.code,
    assignment.course.nom,
    assignment.professor.prenom,
    assignment.professor.nom,
    assignment.professor.email,
    programs,
  ].some((value) => value?.toLowerCase().includes(q));
}

export default function HistoryPage() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSession, setSelectedSession] = useState("");
  const [search, setSearch] = useState("");
  const [statut, setStatut] = useState("");
  const [expandedSession, setExpandedSession] = useState(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/history");
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Erreur lors du chargement de l'historique.");
      }
      setAssignments(json.data ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const sessions = useMemo(() => {
    const map = new Map();
    assignments.forEach((assignment) => {
      if (!map.has(assignment.session.id)) map.set(assignment.session.id, assignment.session);
    });
    return [...map.values()];
  }, [assignments]);

  const filtered = useMemo(() => {
    return assignments.filter((assignment) => {
      if (selectedSession && assignment.session.id !== selectedSession) return false;
      if (statut && assignment.statut !== statut) return false;
      return matchesSearch(assignment, search);
    });
  }, [assignments, search, selectedSession, statut]);

  const groups = useMemo(() => groupBySession(filtered), [filtered]);
  const openedSession = expandedSession ?? groups[0]?.session.id ?? null;

  const resetFilters = () => {
    setSearch("");
    setStatut("");
  };

  return (
    <div className="space-y-6">
      <HistoryHeader totalSessions={sessions.length} loading={loading} onRefresh={fetchHistory} />

      <HistorySessionFilter
        sessions={sessions}
        selectedSession={selectedSession}
        onChange={(value) => {
          setSelectedSession(value);
          setExpandedSession(null);
        }}
      />

      {!loading && !error && (
        <HistoryStats sessionsCount={groups.length} assignments={filtered} />
      )}

      <HistoryToolbar
        search={search}
        onSearchChange={setSearch}
        statut={statut}
        onStatutChange={setStatut}
        onReset={resetFilters}
      />

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-2xl border border-slate-100">
          <RefreshCw className="w-6 h-6 text-emerald-500 animate-spin" />
          <p className="text-sm text-slate-500">Chargement de l&apos;historique...</p>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-red-700">{error}</p>
          <button
            onClick={fetchHistory}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-xl text-sm font-medium hover:bg-red-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </button>
        </div>
      )}

      {!loading && !error && (
        groups.length > 0 ? (
          <div className="space-y-3">
            {groups.map((group) => (
              <HistorySessionCard
                key={group.session.id}
                group={group}
                isOpen={openedSession === group.session.id}
                onToggle={() => setExpandedSession((prev) => (
                  (prev ?? openedSession) === group.session.id ? "" : group.session.id
                ))}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
            <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-sm text-slate-500">
              Aucune affectation ne correspond aux filtres.
            </p>
          </div>
        )
      )}
    </div>
  );
}
