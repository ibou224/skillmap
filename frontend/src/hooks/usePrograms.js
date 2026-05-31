"use client";

/**
 * @module hooks/usePrograms
 * @description Hook CRUD pour les programmes académiques et leurs départements :
 * chargement, validation des champs, création, mise à jour et suppression.
 * Les actions retournent toujours un objet `{ success, message?, fieldErrors?, data? }`.
 */

import { useState, useCallback } from "react";

/**
 * Hook de gestion des programmes académiques.
 *
 * @returns {Object} État et actions.
 * @returns {Array<Object>} returns.programs - Liste des programmes.
 * @returns {Array<Object>} returns.departements - Liste des départements.
 * @returns {boolean} returns.isLoading - Indicateur de chargement.
 * @returns {string|null} returns.error - Message d'erreur éventuel.
 * @returns {Function} returns.fetchPrograms - Charge les programmes.
 * @returns {Function} returns.fetchDepartements - Charge les départements (non bloquant).
 * @returns {Function} returns.createProgram - Crée un programme (avec validation).
 * @returns {Function} returns.updateProgram - Met à jour un programme.
 * @returns {Function} returns.deleteProgram - Supprime un programme.
 */
export function usePrograms() {
  const [programs, setPrograms] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPrograms = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/programs");
      const data = await res.json();
      if (!res.ok)
        throw new Error(
          data.message || "Erreur lors du chargement des programmes.",
        );
      setPrograms(data.data ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchDepartements = useCallback(async () => {
    try {
      const res = await fetch("/api/departements");
      const data = await res.json();
      if (res.ok) setDepartements(data.data ?? []);
    } catch {
      // non bloquant — la liste des départements reste vide
    }
  }, []);

  /**
   * Valide le payload d'un programme (code, nom, nombre d'étapes).
   * @param {Object} payload - Données du programme.
   * @returns {Object} Dictionnaire des erreurs par champ (vide si valide).
   */
  const validate = (payload) => {
    const fieldErrors = {};
    if (!payload.code?.trim()) fieldErrors.code = "Le code est obligatoire.";
    if (!payload.nom?.trim()) fieldErrors.nom = "Le nom est obligatoire.";
    const n = Number(payload.nbEtapes);
    if (!Number.isInteger(n) || n < 1)
      fieldErrors.nbEtapes = "Nombre d'étapes invalide (entier ≥ 1).";
    return fieldErrors;
  };

  /** Retourne toujours { success, message, fieldErrors?, data? } — ne throw jamais */
  const createProgram = useCallback(async (payload) => {
    const fieldErrors = validate(payload);
    if (Object.keys(fieldErrors).length > 0) {
      return { success: false, fieldErrors };
    }
    const res = await fetch("/api/programs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) return { success: false, message: data.message };
    return data;
  }, []);

  const updateProgram = useCallback(async (id, payload) => {
    const fieldErrors = validate(payload);
    if (Object.keys(fieldErrors).length > 0)
      return { success: false, fieldErrors };

    const res = await fetch(`/api/programs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) return { success: false, message: data.message };
    return data;
  }, []);

  const deleteProgram = useCallback(async (id) => {
    const res = await fetch(`/api/programs/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!res.ok || !data.success) return { success: false, message: data.message };
    return data;
  }, []);

  return {
    programs,
    departements,
    isLoading,
    error,
    fetchPrograms,
    fetchDepartements,
    createProgram,
    updateProgram,
    deleteProgram,
  };
}
