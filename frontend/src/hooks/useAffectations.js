/**
 * @module hooks/useAffectations
 * @description Hook de gestion des affectations professeur↔cours : récupération,
 * lancement de l'analyse automatique (asynchrone avec polling de job), mise à
 * jour de statut, ajustement manuel, finalisation et annulation.
 */

import { useState, useCallback } from "react";

/** Intervalle entre deux interrogations de l'état du job d'analyse (ms). */
const POLL_INTERVAL_MS = 2_000;  // 2 secondes entre chaque poll
/** Délai maximum d'attente d'un job d'analyse avant abandon (ms). */
const MAX_WAIT_MS      = 5 * 60 * 1000; // 5 minutes maximum

/**
 * Hook de gestion du cycle de vie des affectations.
 *
 * @returns {Object} État et actions.
 * @returns {Array<Object>} returns.proposals - Propositions d'affectation courantes.
 * @returns {boolean} returns.loading - Indicateur de chargement.
 * @returns {string|null} returns.error - Message d'erreur éventuel.
 * @returns {Object|null} returns.jobProgress - Progression du job d'analyse { step, stepIndex, stepTotal, status }.
 * @returns {Function} returns.fetchAffectations - Recharge les affectations.
 * @returns {Function} returns.analyseAffectations - Lance l'analyse (sessionId, programId, topN, minScore).
 * @returns {Function} returns.updateAssignmentStatus - Met à jour le statut d'une affectation.
 * @returns {Function} returns.saveAdjustment - Sauvegarde un ajustement manuel.
 * @returns {Function} returns.finalizeSessionAssignments - Finalise les affectations AJUSTEE d'une session.
 * @returns {Function} returns.cancelAssignment - Annule une affectation.
 */
export const useAffectations = () => {
  const [proposals, setProposals]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [jobProgress, setJobProgress] = useState(null);
  // jobProgress = { step, stepIndex, stepTotal, status } | null

  const fetchAffectations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/affectations");
      const { success, data, message } = await res.json();
      if (!success) throw new Error(message || "Erreur lors de la récupération des affectations.");
      setProposals(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Polling interne ──────────────────────────────────────────────────────
  /**
   * Poll l'endpoint de statut jusqu'à ce que le job soit DONE ou ERROR.
   * Résout avec les données du job si DONE, rejette si ERROR ou timeout.
   */
  const pollJob = useCallback((jobId) => {
    const start = Date.now();

    return new Promise((resolve, reject) => {
      const tick = async () => {
        // Timeout de sécurité (5 min)
        if (Date.now() - start > MAX_WAIT_MS) {
          reject(new Error("L'analyse a pris trop de temps. Veuillez réessayer."));
          return;
        }

        try {
          const res = await fetch(
            `/api/affectations/analyze/status?jobId=${encodeURIComponent(jobId)}`
          );
          const job = await res.json();

          if (!res.ok || !job.success) {
            reject(new Error(job.message || "Impossible de vérifier l'état du job."));
            return;
          }

          // Mettre à jour la progression dans le state
          setJobProgress({
            step:      job.step,
            stepIndex: job.stepIndex,
            stepTotal: job.stepTotal,
            status:    job.status,
          });

          if (job.status === "DONE") {
            resolve(job.data ?? []);
          } else if (job.status === "ERROR") {
            reject(new Error(job.error || "L'analyse a échoué."));
          } else {
            // PENDING ou RUNNING → re-poll
            setTimeout(tick, POLL_INTERVAL_MS);
          }
        } catch (err) {
          reject(err);
        }
      };

      // Premier poll après un court délai (le job vient d'être créé)
      setTimeout(tick, 500);
    });
  }, []);

  // ── Lancement de l'analyse ───────────────────────────────────────────────
  const analyseAffectations = useCallback(async (sessionId, programId, topN = 5, minScore = 25) => {
    setLoading(true);
    setError(null);
    setJobProgress({ step: "Initialisation...", stepIndex: 0, stepTotal: 7, status: "PENDING" });

    if (!sessionId) {
      setError("Veuillez sélectionner une session.");
      setLoading(false);
      setJobProgress(null);
      return;
    }
    if (!programId) {
      setError("Veuillez sélectionner un programme.");
      setLoading(false);
      setJobProgress(null);
      return;
    }

    try {
      // 1. Créer le job (réponse immédiate avec jobId)
      const res = await fetch("/api/affectations/analyze", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ sessionId, programId, topN, minScore }),
      });
      const { success, jobId, message } = await res.json();
      if (!success || !jobId) throw new Error(message || "Impossible de démarrer l'analyse.");

      // 2. Attendre la fin via polling
      const data = await pollJob(jobId);
      setProposals(data);
      return data;

    } catch (err) {
      setError(err.message);
      setProposals([]);
      throw err;
    } finally {
      setLoading(false);
      setJobProgress(null);
    }
  }, [pollJob]);

  const updateAssignmentStatus = useCallback(async (id, statut) => {
    const res = await fetch(`/api/affectations/${id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ statut }),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok || !result.success) throw new Error(result.message || "Echec mise a jour");
    setProposals((prev) => prev.map((p) => (p.id === id ? { ...p, statut } : p)));
  }, []);

  const saveAdjustment = useCallback(async (id, updates) => {
    const res = await fetch(`/api/affectations/${id}/adjust`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ coursId: updates.cours.id, notes: updates.notes }),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok || !result.success) throw new Error(result.message || "Echec sauvegarde ajustement");
    setProposals((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, cours: updates.cours, statut: "AJUSTEE", notes: updates.notes ?? null } : p
      )
    );
  }, []);

  const finalizeSessionAssignments = useCallback(async (sessionId) => {
    const res = await fetch("/api/affectations/finalize", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ sessionId }),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok || !result.success) throw new Error(result.message || "Echec finalisation des affectations");
    setProposals((prev) =>
      prev.map((p) =>
        p.sessionId === sessionId && p.statut === "AJUSTEE" ? { ...p, statut: "FINALISEE" } : p
      )
    );
    return result;
  }, []);

  const cancelAssignment = useCallback(async (id, motif = "") => {
    const res = await fetch(`/api/affectations/${id}/cancel`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ motif }),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok || !result.success) throw new Error(result.message || "Échec annulation");
    setProposals((prev) => prev.map((p) => (p.id === id ? { ...p, statut: "ANNULEE" } : p)));
    return result;
  }, []);

  return {
    proposals,
    loading,
    error,
    jobProgress,
    fetchAffectations,
    analyseAffectations,
    updateAssignmentStatus,
    saveAdjustment,
    finalizeSessionAssignments,
    cancelAssignment,
  };
};
