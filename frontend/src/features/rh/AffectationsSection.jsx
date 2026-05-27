"use client";

import { useState, useEffect, useMemo } from "react";
import { RefreshCw, Search } from "lucide-react";
import { useAffectations } from "@/hooks/useAffectations";
import { useSessions } from "@/hooks/useSessions";
import AffHeader from "@/components/rh/affectations/AffHeader";
import SessionTabs from "@/components/rh/affectations/SessionTabs";
import AffStats from "@/components/rh/affectations/AffStats";
import AffSearchBar from "@/components/rh/affectations/AffSearchBar";
import { ProfCard } from "@/components/rh/affectations/ProfCard";

export default function AffectationsSection() {
  const { proposals, loading, error, fetchAffectations } = useAffectations();
  const { sessions, fetchSessions } = useSessions();

  const [selectedSession, setSelectedSession] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [launching, setLaunching] = useState(false);

  const handleLancer = async () => {
    if (!selectedSession) return;
    setLaunching(true);
    try {
      const res = await fetch("/api/affectations/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: selectedSession }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchAffectations();
      } else {
        console.error("Erreur lancement affectation :", data.message);
      }
    } catch (err) {
      console.error("Erreur :", err);
    } finally {
      setLaunching(false);
    }
  };

  useEffect(() => {
    fetchAffectations();
    fetchSessions();
  }, [fetchAffectations, fetchSessions]);

  if (!selectedSession && sessions.length > 0) {
    const active = sessions.find((s) => s.statut === "ACTIVE") ?? sessions[0];
    setSelectedSession(active.id);
    setExpanded(null);
  }

  const sessionActive = sessions.find((s) => s.statut === "ACTIVE") ?? null;

  const forSession = useMemo(
    () => proposals.filter((p) => p.sessionId === selectedSession),
    [proposals, selectedSession],
  );

  // Groupement par professeur
  const byProf = useMemo(() => {
    const map = {};
    const q = search.toLowerCase();
    forSession.forEach((p) => {
      const matchSearch =
        !q ||
        p.cours.nom.toLowerCase().includes(q) ||
        p.cours.code.toLowerCase().includes(q) ||
        p.professeur.prenom.toLowerCase().includes(q) ||
        p.professeur.nom.toLowerCase().includes(q);
      const matchStatut = !filterStatut || p.statut === filterStatut;
      if (!matchSearch || !matchStatut) return;

      const pid = p.professeur.id;
      if (!map[pid]) map[pid] = { professeur: p.professeur, affectations: [] };
      map[pid].affectations.push(p);
    });
    return Object.values(map);
  }, [forSession, search, filterStatut]);

  const handleSessionChange = (id) => {
    setSelectedSession(id);
    setExpanded(null);
  };

  const handleRefresh = () => {
    fetchAffectations();
    fetchSessions();
  };

  return (
    <div className="space-y-6">
      <AffHeader
        sessionActive={sessionActive}
        onRefresh={handleRefresh}
        onLancer={handleLancer}
        loading={loading}
        launching={launching}
      />

      {sessions.length > 0 && (
        <SessionTabs sessions={sessions} selected={selectedSession} onChange={handleSessionChange} />
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span className="text-sm">Chargement…</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center text-sm text-red-600">
          {error}
        </div>
      ) : (
        <>
          <AffStats proposals={forSession} />
          <AffSearchBar
            search={search}
            onSearch={setSearch}
            filterStatut={filterStatut}
            onFilter={setFilterStatut}
          />

          {byProf.length === 0 ? (
            <div className="text-center py-16">
              <Search className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-sm text-slate-400">
                {search || filterStatut ? "Aucun résultat pour cette recherche" : "Aucune affectation pour cette session"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {byProf.map(({ professeur, affectations }) => (
                <ProfCard
                  key={professeur.id}
                  professeur={professeur}
                  affectations={affectations}
                  isOpen={expanded === professeur.id}
                  onToggle={() => setExpanded((p) => (p === professeur.id ? null : professeur.id))}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
