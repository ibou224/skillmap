import { useState, useCallback } from "react";

export default function useLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/logs");
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          data.message,
        );
      setLogs(data.data);
      return data.data;
    } catch (err) {
      console.error("Erreur lors de la récupération des logs :", err);
      setError("Erreur lors de la récupération des logs.");
    } finally {
      setLoading(false);
    }
  }, []);

  return { logs, loading, error, fetchLogs };
}
