"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { RefreshCw, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";

import AffectationHeader from "@/components/affectations/AffectationHeader";
import AffectationStats from "@/components/affectations/AffectationStats";
import AffectationToolbar from "@/components/affectations/AffectationToolbar";
import CourseGroup from "@/components/affectations/CourseGroup";
import AjustementModal from "@/components/affectations/AjustementModal";
import Toast from "@/components/affectations/Toast";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { PONDERATIONS_DEFAUT } from "@/constants/affectations";
import { useSessions } from "@/hooks/useSessions";
import { useWeights } from "@/hooks/useWeights";
import { useAffectations } from "@/hooks/useAffectations";
import { useCourses } from "@/hooks/useCourses";

const PAGE_SIZE = 15;

export default function AffectationPage() {
  const { sessions, fetchSessions }                              = useSessions();
  const { programmes, fetchProgrammes, courses, fetchCourses }   = useCourses();
  const {
    analyseAffectations, fetchAffectations,
    proposals, loading, error, jobProgress,
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
          setTopN(found.topN ?? 5);
          setMinScore(found.minScore ?? 25);
        } else {
          setLocalWeights(PONDERATIONS_DEFAUT);
          setTopN(5);
          setMinScore(25);
        }
      } catch {
        setToast({ message: "Impossible de charger les pondérations.", type: "error" });
      }
    };
    loadWeights();
  }, [sessionId, fetchWeights]);

  const proposalsForSession = useMemo(() => {
    if (!sessionId) return [];
    return proposals.filter((p) => p.sessionId === sessionId);
  }, [proposals, sessionId]);

  // Nb de cours proposés/validés/finalisés par professeur dans la session
  // → affiché comme badge de charge dans CourseGroup (#20)
  const profCourseCount = useMemo(() => {
    const map = new Map();
    proposalsForSession.forEach((p) => {
      map.set(p.professeur.id, (map.get(p.professeur.id) ?? 0) + 1);
    });
    return map;
  }, [proposalsForSession]);

const filteredGroups = useMemo(() => {
    const q = search?.toLowerCase() || "";

    const filteredProposals = proposalsForSession.filter((p) => {
      const matchProgram = !programId || p.cours.programmes?.some((pr) => pr.id === programId);

      const matchSearch =
        !q ||
        p.cours.nom?.toLowerCase().includes(q) ||
        p.cours.code?.toLowerCase().includes(q) ||
        p.professeur.prenom?.toLowerCase().includes(q) ||
        p.professeur.nom?.toLowerCase().includes(q) ||
        p.professeur.competences?.some((c) => c?.toLowerCase().includes(q));

      const matchStatut = !filterStatut || p.statut === filterStatut;

      // On combine toutes les conditions
      return matchProgram && matchSearch && matchStatut;
    });

    // Grouper par cours
    const map = new Map();
    filteredProposals.forEach((p) => {
      const cid = p.cours.id;
      if (!map.has(cid)) map.set(cid, { cours: p.cours, proposals: [] });
      map.get(cid).proposals.push(p);
    });

    const groups = Array.from(map.values());
    groups.forEach((g) => g.proposals.sort((a, b) => b.score - a.score));
    return groups;
  }, [proposalsForSession, search, filterStatut, programId]);

  const totalPages      = Math.max(1, Math.ceil(filteredGroups.length / PAGE_SIZE));
  const currentPage     = Math.min(page, totalPages);
  const paginatedGroups = filteredGroups.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const finalizeInfo = useMemo(() => {
    const proposed  = proposalsForSession.filter((p) => p.statut === "PROPOSEE").length;
    const adjusted  = proposalsForSession.filter((p) => p.statut === "AJUSTEE").length;
    const finalized = proposalsForSession.filter((p) => p.statut === "FINALISEE").length;

    if (!sessionId)                       return { canFinalize: false, reason: "Sélectionnez une session.",       proposed, adjusted, finalized };
    if (proposalsForSession.length === 0) return { canFinalize: false, reason: "Aucune affectation à finaliser.", proposed, adjusted, finalized };
    if (adjusted === 0)                   return { canFinalize: false, reason: "Aucune affectation ajustée à finaliser.", proposed, adjusted, finalized };

    return { canFinalize: true, reason: "", proposed, adjusted, finalized };
  }, [proposalsForSession, sessionId]);

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
        topN,
        minScore,
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

        {/* ── États loading / erreur / vide ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            {/* Spinner animé */}
            <div className="relative w-16 h-16 shrink-0">
              <div className="absolute inset-0 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <RefreshCw className="w-7 h-7 text-emerald-500 animate-spin" />
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-emerald-200 dark:border-emerald-800 border-t-emerald-500 animate-spin" />
            </div>

            {jobProgress ? (
              /* Progression par étapes (pendant l'analyse asynchrone) */
              <div className="w-full max-w-xs space-y-3 px-2">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 text-center">
                  {jobProgress.step}
                </p>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${Math.round(((jobProgress.stepIndex + 1) / jobProgress.stepTotal) * 100)}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 text-center tabular-nums">
                  Étape {jobProgress.stepIndex + 1} / {jobProgress.stepTotal}
                </p>
              </div>
            ) : (
              /* Chargement simple (fetchAffectations, etc.) */
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Chargement…
              </p>
            )}
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6">
            <p className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>
          </div>
        ) : proposalsForSession.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-14 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-7 h-7 text-slate-400" />
            </div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Aucune proposition générée</h3>
            <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto">
              Sélectionnez une session et un programme, puis cliquez sur &quot;Lancer l&apos;algorithme&quot;.
            </p>
          </div>
        ) : (
          <>
            {/* ── Groupes par cours ── */}
            {filteredGroups.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
                <p className="text-sm text-slate-500">Aucune proposition ne correspond aux filtres</p>
                <button onClick={handleResetFilters} className="mt-3 text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {paginatedGroups.map(({ cours, proposals }) => (
                  <CourseGroup
                    key={cours.id}
                    cours={cours}
                    proposals={proposals}
                    onAction={handleAction}
                    weights={localWeights}
                    expandedProposalId={expandedId}
                    onToggleProposal={handleToggleExpand}
                    profCourseCount={profCourseCount}
                  />
                ))}
              </div>
            )}

            {/* ── Pagination + compteur ── */}
            {filteredGroups.length > 0 && (
              <div className="flex items-center justify-between px-1 pt-1">
                <p className="text-xs text-slate-400">
                  {filteredGroups.length} cours · {proposalsForSession.length} proposition{proposalsForSession.length > 1 ? "s" : ""}
                  {" "}· page {currentPage} / {totalPages}
                </p>
                {totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage <= 1}
                      className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 transition"
                    >
                      <ChevronLeft className="w-4 h-4 text-slate-500" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                      .reduce((acc, p, i, arr) => { if (i > 0 && p - arr[i - 1] > 1) acc.push("…"); acc.push(p); return acc; }, [])
                      .map((p, i) =>
                        p === "…" ? (
                          <span key={`e-${i}`} className="px-1 text-slate-400 text-xs">…</span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={`w-7 h-7 rounded-lg text-xs font-semibold transition ${
                              p === currentPage
                                ? "bg-[hsl(134,35%,45%)] text-white"
                                : "hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
                            }`}
                          >
                            {p}
                          </button>
                        )
                      )}
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage >= totalPages}
                      className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 transition"
                    >
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
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
