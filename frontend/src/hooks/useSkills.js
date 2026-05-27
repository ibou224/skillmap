import { useState, useEffect, useCallback } from "react";

export default function useSkills() {
  const [skills, setSkills] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSkills = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/skills");
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Erreur lors de la récupération.");
      setSkills(data.data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createSkill = useCallback(async (payload) => {
    const res = await fetch("/api/skills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Erreur lors de la création.");
    return data;
  }, []);

  const updateSkill = useCallback(async (id, payload) => {
    const res = await fetch(`/api/skills/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Erreur lors de la modification.");
    return data;
  }, []);

  const deleteSkill = useCallback(async (id) => {
    const res = await fetch(`/api/skills/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Erreur lors de la suppression.");
    return data;
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchSkills(); }, [fetchSkills]);

  return { skills, error, isLoading, fetchSkills, createSkill, updateSkill, deleteSkill };
}
