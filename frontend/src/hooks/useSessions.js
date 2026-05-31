/**
 * @module hooks/useSessions
 * @description Hook CRUD pour la gestion des sessions académiques.
 * Gère la création, modification et suppression de sessions avec validation de dates.
 */

"use client";

import { useState, useCallback } from "react";
import { isValidString } from "@/lib/validation";

const isValidDate = (date) => Boolean(date) && !isNaN(new Date(date).getTime());

const DEFAULT_PAGINATION = { total: 0, page: 1, limit: 10, totalPages: 0 };

/**
 * Hook pour gérer les sessions académiques avec opérations CRUD.
 * 
 * Fournit l'accès complet à:
 * - Récupération des sessions avec pagination
 * - Création/modification/suppression de sessions avec validation
 * - Gestion des dates (début/fin de session)
 * 
 * @returns {Object} L'objet contenant l'état et toutes les actions
 * @returns {Array<Object>} returns.sessions - Liste des sessions
 * @returns {Object} returns.pagination - Info pagination
 * @returns {boolean} returns.isLoading - État de chargement
 * @returns {string|null} returns.error - Message d'erreur
 * @returns {Function} returns.fetchSessions - Charge les sessions avec filtres
 * @returns {Function} returns.createSession - Crée une nouvelle session
 * @returns {Function} returns.updateSession - Met à jour une session
 * @returns {Function} returns.deleteSession - Supprime une session
 * @returns {Function} returns.setSessions - Setter direct (cas spéciaux)
 * @returns {Function} returns.setError - Setter direct d'erreur
 * 
 * @example
 * const { sessions, createSession, error } = useSessions();
 * 
 * const result = await createSession({
 *   nom: 'Session 2024-2025',
 *   dateDebut: new Date('2024-09-01'),
 *   dateFin: new Date('2025-08-31')
 * });
 */
export function useSessions() {
  const [sessions, setSessions] = useState([]);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Récupère toutes les sessions avec pagination optionnelle.
   * 
   * @async
   * @param {Object} [filters={}] - Filtres de pagination
   * @param {number} [filters.page] - Numéro de page
   * @param {number} [filters.limit] - Nombre de sessions par page
   * 
   * @returns {Promise<Array>} Tableau des sessions
   */
  const fetchSessions = useCallback(async (filters = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.page) params.set("page", filters.page);
      if (filters.limit) params.set("limit", filters.limit);
      if(filters.search) params.set("search", filters.search);

      const response = await fetch(`/api/sessions?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la récupération des sessions.");
      }
      const data = await response.json();
      setSessions(Array.isArray(data.data) ? data.data : []);
      setPagination(data.pagination || DEFAULT_PAGINATION);
      return data;
    } catch (err) {
      console.error("Erreur fetchSessions:", err);
      setError(err.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Crée une nouvelle session avec validation complète des dates.
   * 
   * Valide:
   * - Le nom n'est pas vide
   * - Les dates sont valides
   * - La date de début est antérieure à la date de fin
   * 
   * @async
   * @param {Object} sessionData - Données de la session
   * @param {string} sessionData.nom - Nom de la session (ex: "Session 2024-2025")
   * @param {Date|string} sessionData.dateDebut - Date de début
   * @param {Date|string} sessionData.dateFin - Date de fin
   * 
   * @returns {Promise<Object>} { success: boolean, data?: Object, message?: string }
   */
  const createSession = useCallback(async (sessionData) => {
    setIsLoading(true);
    setError(null);
    try {
      if (!isValidString(sessionData.nom)) {
        const msg = "Le nom de la session est invalide.";
        setError(msg);
        setIsLoading(false);
        return { success: false, message: msg };
      }

      if (
        !isValidDate(sessionData.dateDebut) ||
        !isValidDate(sessionData.dateFin)
      ) {
        const msg = "Les dates de la session sont invalides.";
        setError(msg);
        setIsLoading(false);
        return { success: false, message: msg };
      }

      if (sessionData.dateDebut > sessionData.dateFin) {
        const msg = "La date de début doit être antérieure à la date de fin.";
        setError(msg);
        setIsLoading(false);
        return { success: false, message: msg };
      }

      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sessionData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la création de la session.");
      }
      const result = await response.json();
      setSessions((prev) => [...prev, result.data]);
      return { success: true, data: result.data };
    } catch (err) {
      console.warn("createSession:", err.message);
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Met à jour une session existante avec validation des dates.
   * 
   * @async
   * @param {string} id - ID de la session à mettre à jour
   * @param {Object} sessionData - Champs à mettre à jour
   * @param {string} [sessionData.nom] - Nouveau nom
   * @param {Date|string} [sessionData.dateDebut] - Nouvelle date de début
   * @param {Date|string} [sessionData.dateFin] - Nouvelle date de fin
   * 
   * @returns {Promise<Object>} { success: boolean, data?: Object, message?: string }
   */
  const updateSession = useCallback(async (id, sessionData) => {
    if (!id) return { success: false, message: "ID manquant." };
    setIsLoading(true);
    setError(null);
    try {
      if (!isValidString(sessionData.nom)) {
        const msg = "Le nom de la session est invalide.";
        setError(msg);
        setIsLoading(false);
        return { success: false, message: msg };
      }

      if (
        !isValidDate(sessionData.dateDebut) ||
        !isValidDate(sessionData.dateFin)
      ) {
        const msg = "Les dates de la session sont invalides.";
        setError(msg);
        setIsLoading(false);
        return { success: false, message: msg };
      }

      if (sessionData.dateDebut > sessionData.dateFin) {
        const msg = "La date de début doit être antérieure à la date de fin.";
        setError(msg);
        setIsLoading(false);
        return { success: false, message: msg };
      }

      const response = await fetch(`/api/sessions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sessionData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la mise à jour de la session.");
      }
      const result = await response.json();
      setSessions((prev) => prev.map((s) => (s.id === id ? result.data : s)));
      return { success: true, data: result.data };
    } catch (err) {
      console.error("Erreur updateSession:", err);
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Supprime une session par ID.
   * 
   * @async
   * @param {string} id - ID de la session à supprimer
   * 
   * @returns {Promise<Object>} { success: boolean, data?: Object, message?: string }
   */
  const deleteSession = useCallback(async (id) => {
    if (!id) return { success: false, message: "ID manquant." };
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/sessions/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la suppression de la session.");
      }
      setSessions((prev) => prev.filter((s) => s.id !== id));
      return { success: true, data: response.data || response };
    } catch (err) {
      console.error("Erreur deleteSession:", err);
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const activateSession = useCallback(async (id) => {
    if (!id) return { success: false, message: "ID manquant." };
    try {
      const response = await fetch(`/api/sessions/${id}/activate`, { method: "PUT" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Erreur lors de l'activation.");
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === id)    return { ...s, statut: "ACTIVE" };
          if (s.statut === "ACTIVE") return { ...s, statut: "ARCHIVEE" };
          return s;
        })
      );
      return { success: true, data: result.data };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }, []);

  return {
    sessions,
    pagination,
    isLoading,
    error,
    fetchSessions,
    createSession,
    updateSession,
    deleteSession,
    activateSession,
    setSessions,
    setError,
  };
}
