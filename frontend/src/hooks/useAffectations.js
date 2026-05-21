import { useState,useCallback } from "react";

export const useAffectations = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const fetchAffectations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
        const res = await fetch("/api/affectations");
        const { success, data, message } = await res.json();
        if (!success) {
          throw new Error(message || "Erreur lors de la récupération des affectations.");
        }
        setProposals(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
  }, []);

  const analyseAffectations = useCallback(async (sessionId, programId) => {
    setLoading(true);
    setError(null);
    if(!sessionId) {
      setError("Veuillez sélectionner une session.");
      setLoading(false);
      return;
    }
    if(!programId) {
      setError("Veuillez sélectionner un programme.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/affectations/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, programId: programId }),
      });
      const { success, data, message } = await res.json();
      if (!success) throw new Error(message);
      setProposals(data);
      return data;
    } catch (err) {
      setError(err.message);
      setProposals([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAssignmentStatus = useCallback(async (id, statut) => {
    const res = await fetch(`/api/affectations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut }),
    });
    if (!res.ok) throw new Error("Échec mise à jour");
    setProposals(prev => prev.map(p => p.id === id ? { ...p, statut } : p));
  }, []);

  const saveAdjustment = useCallback(async (id, updates) => {
    const res = await fetch(`/api/affectations/${id}/adjust`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coursId: updates.cours.id, notes: updates.notes }),
    });
    if (!res.ok) throw new Error("Échec sauvegarde ajustement");
    setProposals(prev => prev.map(p => p.id === id ? { ...p, cours: updates.cours, statut: "AJUSTEE", notes: updates.notes } : p));
  }, []);

  return {
    proposals,
    loading,
    error,
    fetchAffectations,
    analyseAffectations,
    updateAssignmentStatus,
    saveAdjustment,
  };
};
  