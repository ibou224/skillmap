"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, ChevronLeft, ChevronRight, RefreshCw, Search } from "lucide-react";

import HistoryHeader from "./components/HistoryHeader";
import HistorySessionFilter from "./components/HistorySessionFilter";
import HistoryStats from "./components/HistoryStats";
import HistoryToolbar from "./components/HistoryToolbar";
import HistorySessionCard from "./components/HistorySessionCard";
import GroupBySession from "./components/GroupBySession";
import useHistory from "@/hooks/useHistory";

const PAGE_SIZE = 10;

function matchesSearch(assignment, query) {
  if (!query) return true;
  const q = query.toLowerCase();
  const programs = assignment.course.programs
    ?.map((p) => `${p.code} ${p.nom}`)
    .join(" ") ?? "";

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
  const { assignments, loading, error, fetchHistory } = useHistory();
  const [selectedSession, setSelectedSession] = useState("");
  const [search, setSearch]               = useState("");
  const [expandedSession, setExpandedSession] = useState(null);
  const [page, setPage]                   = useState(1);
  

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const sessions = useMemo(() => {
    const map = new Map();
    assignments.forEach((a) => {
      if (!map.has(a.session.id)) map.set(a.session.id, a.session);
    });
    return [...map.values()];
  }, [assignments]);

  const filtered = useMemo(() =>
    assignments.filter((a) => {
      if (selectedSession && a.session.id !== selectedSession) return false;
      return matchesSearch(a, search);
    }),
    [assignments, search, selectedSession],
  );

  const groups = useMemo(() => GroupBySession(filtered), [filtered]);

  const totalPages      = Math.max(1, Math.ceil(groups.length / PAGE_SIZE));
  const currentPage     = Math.min(page, totalPages);
  const paginatedGroups = groups.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const openedSession   = expandedSession ?? paginatedGroups[0]?.session.id ?? null;

  return (
    <div className="space-y-6">
      <HistoryHeader totalSessions={sessions.length} loading={loading} onRefresh={fetchHistory} />

      <HistorySessionFilter
        sessions={sessions}
        selectedSession={selectedSession}
        onChange={(value) => { setSelectedSession(value); setExpandedSession(null); setPage(1); }}
      />

      {!loading && !error && (
        <HistoryStats sessionsCount={groups.length} assignments={filtered} />
      )}

      <HistoryToolbar
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        onReset={() => { setSearch(""); setPage(1); }}
      />

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-2xl border border-slate-100">
          <RefreshCw className="w-6 h-6 text-emerald-500 animate-spin" />
          <p className="text-sm text-slate-500">Chargement de l&apos;historique…</p>
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
          <>
            <div className="space-y-3">
              {paginatedGroups.map((group) => (
                <HistorySessionCard
                  key={group.session.id}
                  group={group}
                  isOpen={openedSession === group.session.id}
                  onToggle={() => setExpandedSession((prev) =>
                    (prev ?? openedSession) === group.session.id ? "" : group.session.id
                  )}
                />
              ))}
            </div>

            {/* Pagination des sessions */}
            <div className="flex items-center justify-between px-1">
              <p className="text-xs text-slate-400">
                {groups.length} session{groups.length > 1 ? "s" : ""} — page {currentPage} / {totalPages}
              </p>
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { setPage((p) => Math.max(1, p - 1)); setExpandedSession(null); }}
                    disabled={currentPage <= 1}
                    className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-40 transition"
                  >
                    <ChevronLeft className="w-4 h-4 text-slate-500" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                    .reduce((acc, p, i, arr) => {
                      if (i > 0 && p - arr[i - 1] > 1) acc.push("…");
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) =>
                      p === "…" ? (
                        <span key={`e-${i}`} className="px-1 text-slate-400 text-xs">…</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => { setPage(p); setExpandedSession(null); }}
                          className={`w-7 h-7 rounded-lg text-xs font-semibold transition ${
                            p === currentPage
                              ? "bg-[hsl(134,35%,45%)] text-white"
                              : "hover:bg-slate-100 text-slate-500"
                          }`}
                        >
                          {p}
                        </button>
                      )
                    )}
                  <button
                    onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); setExpandedSession(null); }}
                    disabled={currentPage >= totalPages}
                    className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-40 transition"
                  >
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
            <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-sm text-slate-500">
              {search || selectedSession
                ? "Aucune affectation finalisée ne correspond aux filtres."
                : "Aucune affectation finalisée pour le moment."}
            </p>
          </div>
        )
      )}
    </div>
  );
}
