/**
 * @module hooks/useHistory
 * @description Hook de chargement de l'historique des affectations depuis l'API.
 * Le filtrage et le regroupement sont délégués au composant appelant.
 */

import { useState,useCallback } from "react";

/**
 * Charge l'historique des affectations.
 *
 * @returns {Object} État et actions.
 * @returns {Array<Object>} returns.assignments - Affectations historisées.
 * @returns {boolean} returns.loading - Indicateur de chargement.
 * @returns {string|null} returns.error - Message d'erreur éventuel.
 * @returns {Function} returns.fetchHistory - Recharge l'historique.
 */
export default function useHistory() {
  const [assignments, setAssignments]     = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);

    const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch("/api/history");
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

  return {
    assignments,
    loading,
    error,
    fetchHistory,
  };

}