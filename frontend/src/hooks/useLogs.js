/**
 * @module hooks/useLogs
 * @description Hook de récupération des logs d'audit (administration).
 */

import { useState, useCallback } from "react";

/**
 * Récupère tous les logs d'audit depuis l'API.
 * Le filtrage et la pagination sont gérés par le composant appelant.
 *
 * @returns {Object} État et actions.
 * @returns {Array<Object>} returns.logs - Logs d'audit chargés.
 * @returns {boolean} returns.loading - Indicateur de chargement.
 * @returns {string|null} returns.error - Message d'erreur éventuel.
 * @returns {Function} returns.fetchLogs - Recharge les logs.
 */
export default function useLogs() {
  const [logs, setLogs]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/logs");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Erreur ${res.status}`);
      setLogs(data.data ?? []);
      return data.data;
    } catch (err) {
      console.error("Erreur lors de la récupération des logs :", err);
      setError(err.message);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { logs, loading, error, fetchLogs };
}
