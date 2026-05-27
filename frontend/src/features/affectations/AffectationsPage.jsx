"use client";

import { useState, useCallback, useMemo, useEffect } from "react";

import AffectationHeader from "@/components/affectations/AffectationHeader";
import AffectationStats from "@/components/affectations/AffectationStats";
import AffectationToolbar from "@/components/affectations/AffectationToolbar";
import ProposalTable from "@/components/affectations/ProposalTable";
import AjustementModal from "@/components/affectations/AjustementModal";
import Toast from "@/components/affectations/Toast";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { PONDERATIONS_DEFAUT } from "@/constants/affectations";
import { useSessions } from "@/hooks/useSessions";
import { useWeights } from "@/hooks/useWeights";
import { useAffectations } from "@/hooks/useAffectations";
import { useCourses } from "@/hooks/useCourses";

const PAGE_SIZE = 50;

export default function AffectationPage() {
  const { sessions, fetchSessions }                              = useSessions();
  const { programmes, fetchProgrammes, courses, fetchCourses }   = useCourses();
  const {
    analyseAffectations, fetchAffectations,
    proposals, loading, error,
    updateAssignmentStatus, saveAdjustment,
    finalizeSessionAssignments,
  } = useAffectations();
  const { updateWeight, fetchWeights } = useWeights();

  const [localWeights, setLocalWeights]           = useState(PONDERATIONS_DEFAUT);
  const [topN, setTopN]                           = useState(5);
  const [minScore, setMinScore]                   = useState(25);
  const [sessionId, setSessionId]                 = useState("");
  const [programId, setProgramId]                 = useState("");
  const [hasRun, setHasRun]                       = useState(false);
  const [search, setSearch]                       = useState("");
  const [filterStatut, setFilterStatut]           = useState("");
  const [page, setPage]                           = useState(1);
  const [expandedId, setExpandedId]               = useState(null);
  const [editProposal, setEditProposal]           = useState(null);
  const [pendingAdjustment, setPendingAdjustment] = useState(null);
  const [confirmFinalizeAll, setConfirmFinalizeAll] = useState(false);
  const [actionLoading, setActionLoading]         = useState(false);
  const [toast, setToast]                         = useState(null);
  const [showWeights, setShowWeights]             = useState(false);

  const totalWeight  = Object.values(localWeights).reduce((s, w) => s + w.weight, 0);
  const weightsValid = totalWeight === 100;

  useEffect(() => {
    fetchSessions();
    fetchAffectations();
    fetchProgrammes();
    fetchCourses();
  }, [fetchAffectations, fetchSessions, fetchProgrammes, fetchCourses]);

  useEffect(() => {
    if (!sessionId) return;
    const loadWeights = async () => {
      try {
        const allWeights = await fetchWeights();
        const found = allWeights.find((w) => w.sessionId === sessionId);
        if (found) {
          setLocalWeights({
            competences: { ...PONDERATIONS_DEFAUT.competences, weight: found.competencesPct },
            experience:  { ...PONDERATIONS_DEFAUT.experience,  weight: found.experiencePct  },
            formation:   { ...PONDERATIONS_DEFAUT.formation,   weight: found.formationPct   },
            historique:  { ...PONDERATIONS_DEFAUT.historique,  weight: found.historiquePct  },
          });
        } else {
          setLocalWeights(PONDERATIONS_DEFAUT);
        }
      } catch {
        setToast({ message: "Impossible de charger les pondérations.", type: "error" });
      }
    };
    loadWeights();
  }, [sessionId, fetchWeights]);

  // ── Données dérivées ───────────────────────────────────────────────────────

  const proposalsForSession = useMemo(() => {
    if (!sessionId) return [];
    return proposals.filter((p) => p.sessionId === sessionId);
  }, [proposals, sessionId]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return proposalsForSession.filter((p) => {
      const matchSearch =
        !q ||
        p.cours.nom.toLowerCase().includes(q) ||
        p.cours.code.toLowerCase().includes(q) ||
        p.professeur.prenom.toLowerCase().includes(q) ||
        p.professeur.nom.toLowerCase().includes(q) ||
        p.professeur.competences.some((c) => c.toLowerCase().includes(q));
      return matchSearch && (!filterStatut || p.statut === filterStatut);
    });
  }, [proposalsForSession, search, filterStatut]);

  const totalPages        = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage       = Math.min(page, totalPages);
  const paginatedFiltered = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const finalizeInfo = useMemo(() => {
    const proposed  = proposalsForSession.filter((p) => p.statut === "PROPOSEE").length;
    const adjusted  = proposalsForSession.filter((p) => p.statut === "AJUSTEE").length;
    const finalized = proposalsForSession.filter((p) => p.statut === "FINALISEE").length;

    if (!sessionId)                       return { canFinalize: false, reason: "Sélectionnez une session.",       proposed, adjusted, finalized };
    if (proposalsForSession.length === 0) return { canFinalize: false, reason: "Aucune affectation à finaliser.", proposed, adjusted, finalized };
    if (adjusted === 0)                   return { canFinalize: false, reason: "Aucune affectation ajustée à finaliser.", proposed, adjusted, finalized };

    return { canFinalize: true, reason: "", proposed, adjusted, finalized };
  }, [proposalsForSession, sessionId]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleRun = useCallback(async () => {
    if (!sessionId || !programId) {
      setToast({ message: "Sélectionnez une session et un programme", type: "error" });
      return;
    }
    if (!weightsValid) {
      setToast({ message: `Les pondérations doivent totaliser 100% (actuellement ${totalWeight}%)`, type: "error" });
      return;
    }

    try {
      await updateWeight(sessionId, {
        competencesPct: localWeights.competences.weight,
        experiencePct:  localWeights.experience.weight,
        formationPct:   localWeights.formation.weight,
        historiquePct:  localWeights.historique.weight,
      });
    } catch {
      setToast({ message: "Erreur lors de la mise à jour des pondérations", type: "error" });
      return;
    }

    setExpandedId(null);
    setHasRun(true);
    setPage(1);

    try {
      await analyseAffectations(sessionId, programId, topN, minScore);
      await fetchAffectations();
      setToast({ message: "Analyse terminée avec succès", type: "success" });
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    }
  }, [sessionId, programId, weightsValid, totalWeight, localWeights, topN, minScore, updateWeight, analyseAffectations, fetchAffectations]);

  const handleAction = useCallback(
    async (action, id) => {
      if (action === "adjust") {
        setEditProposal(proposals.find((p) => p.id === id) ?? null);
        return;
      }
      const TRANSITIONS = { validate: "AJUSTEE", finalize: "FINALISEE" };
      const next = TRANSITIONS[action];
      if (!next) return;
      try {
        await updateAssignmentStatus(id, next);
        setToast({ message: "Statut mis à jour", type: "success" });
        if (next === "FINALISEE") setExpandedId(null);
      } catch (err) {
        setToast({ message: err.message, type: "error" });
      }
    },
    [proposals, updateAssignmentStatus]
  );

  const handleSaveAdjustment = useCallback((id, updates) => {
    setPendingAdjustment({ id, updates });
  }, []);

  const handleConfirmAdjustment = useCallback(async () => {
    if (!pendingAdjustment) return;
    setActionLoading(true);
    try {
      await saveAdjustment(pendingAdjustment.id, pendingAdjustment.updates);
      setToast({ message: "Ajustement enregistré", type: "success" });
      setEditProposal(null);
      setPendingAdjustment(null);
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    } finally {
      setActionLoading(false);
    }
  }, [pendingAdjustment, saveAdjustment]);

  const handleFinalizeAll = useCallback(async () => {
    if (!sessionId) return;
    setActionLoading(true);
    try {
      const result = await finalizeSessionAssignments(sessionId);
      setExpandedId(null);
      setConfirmFinalizeAll(false);
      setToast({ message: result.message || "Affectations finalisées", type: "success" });
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    } finally {
      setActionLoading(false);
    }
  }, [finalizeSessionAssignments, sessionId]);

  const handleWeightChange = useCallback((key, value) => {
    const n   = parseInt(value, 10);
    const cfg = PONDERATIONS_DEFAUT[key];
    if (isNaN(n) || n < cfg.min || n > cfg.max) return;
    setLocalWeights((prev) => ({ ...prev, [key]: { ...prev[key], weight: n } }));
  }, []);

  const handleToggleExpand  = useCallback((id) => setExpandedId((prev) => (prev === id ? null : id)), []);
  const handleResetFilters  = useCallback(() => { setSearch(""); setFilterStatut(""); setPage(1); }, []);

  // ── Rendu ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <AffectationHeader
        sessionId={sessionId}
        programId={programId}
        onSessionChange={(v) => { setSessionId(v); setPage(1); }}
        onProgramChange={setProgramId}
        onRun={handleRun}
        loading={loading}
        hasRun={hasRun}
        weights={localWeights}
        onWeightChange={handleWeightChange}
        showWeights={showWeights}
        onToggleWeights={() => setShowWeights((v) => !v)}
        sessions={sessions}
        programmes={programmes}
        topN={topN}
        onTopNChange={setTopN}
        minScore={minScore}
        onMinScoreChange={setMinScore}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {proposalsForSession.length > 0 && (
          <AffectationStats proposals={proposalsForSession} />
        )}

        {proposalsForSession.length > 0 && (
          <AffectationToolbar
            search={search}
            onSearchChange={(v) => { setSearch(v); setPage(1); }}
            filterStatut={filterStatut}
            onFilterChange={(v) => { setFilterStatut(v); setPage(1); }}
            onFinalizeAll={() => setConfirmFinalizeAll(true)}
            canFinalizeAll={finalizeInfo.canFinalize && !actionLoading}
            finalizeDisabledReason={finalizeInfo.reason}
          />
        )}

        <ProposalTable
          proposals={proposalsForSession}
          filtered={paginatedFiltered}
          totalFiltered={filtered.length}
          loading={loading}
          error={error}
          onRetry={handleRun}
          expandedId={expandedId}
          onToggleExpand={handleToggleExpand}
          onAction={handleAction}
          onResetFilters={handleResetFilters}
          weights={localWeights}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </main>

      <AjustementModal
        key={editProposal?.id ?? "closed-adjustment"}
        isOpen={!!editProposal}
        proposal={editProposal}
        onClose={() => setEditProposal(null)}
        onSave={handleSaveAdjustment}
        courses={courses}
      />

      <ConfirmModal
        isOpen={!!pendingAdjustment}
        title="Confirmer l'ajustement"
        message="Cette action changera le cours de l'affectation et passera son statut à AJUSTEE. L'action sera inscrite au journal d'audit."
        onConfirm={handleConfirmAdjustment}
        onCancel={() => setPendingAdjustment(null)}
        isLoading={actionLoading}
      />

      <ConfirmModal
        isOpen={confirmFinalizeAll}
        title="Finaliser toutes les affectations"
        message={`Cette action finalisera ${finalizeInfo.adjusted} affectation(s) ajustée(s) pour la session sélectionnée. Les affectations finalisées ne pourront plus être ajustées.`}
        onConfirm={handleFinalizeAll}
        onCancel={() => setConfirmFinalizeAll(false)}
        isLoading={actionLoading}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
