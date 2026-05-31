/**
 * @module hooks/useSkills
 * @description Hook CRUD pour les compétences : chargement initial automatique,
 * création, modification et suppression.
 */

import { useState, useEffect, useCallback } from "react";

/**
 * Hook de gestion des compétences (référentiel).
 *
 * @returns {Object} État et actions.
 * @returns {Array<Object>} returns.skills - Liste des compétences.
 * @returns {string|null} returns.error - Message d'erreur éventuel.
 * @returns {boolean} returns.isLoading - Indicateur de chargement.
 * @returns {Function} returns.fetchSkills - Recharge les compétences.
 * @returns {Function} returns.createSkill - Crée une compétence.
 * @returns {Function} returns.updateSkill - Met à jour une compétence.
 * @returns {Function} returns.deleteSkill - Supprime une compétence.
 */
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
