import { useState,useCallback } from "react";

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