/**
 * @module hooks/useWeights
 * @description Hook de gestion des pondérations de l'algorithme de matching par
 * session : chargement et mise à jour (avec validation de la somme = 100 %).
 */

import { useState, useCallback } from "react";
import { isValidateWeights } from "@/lib/validation";

/**
 * Hook de gestion des pondérations de matching.
 *
 * @returns {Object} État et actions.
 * @returns {Array<Object>} returns.weights - Configurations de pondération par session.
 * @returns {boolean} returns.isLoading - Indicateur de chargement.
 * @returns {string|null} returns.error - Message d'erreur éventuel.
 * @returns {Function} returns.fetchWeights - Charge les pondérations.
 * @returns {Function} returns.updateWeight - Met à jour les pondérations d'une session.
 */
export const useWeights = () => {
    const [weights, setWeights] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchWeights = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/weights");
            if (!res.ok) throw new Error(`Erreur ${res.status}`);
            const data = await res.json();
            if (!data.success) throw new Error(data.message || "Erreur inconnue");
            setWeights(data.data);
            return data.data;
        } catch (err) {
            setError(err.message || "Erreur inconnue");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateWeight = useCallback(async (sessionId, newWeights) => {
        if (!sessionId || !newWeights) return;

        const newConfiguration = {
            sessionId,
            competencesPct: newWeights.competencesPct,
            experiencePct:  newWeights.experiencePct,
            formationPct:   newWeights.formationPct,
            historiquePct:  newWeights.historiquePct,
            topN:           newWeights.topN,
            minScore:       newWeights.minScore,
        };
        console.log("[useWeights] envoi:", JSON.stringify(newConfiguration));
        const validation = isValidateWeights(newConfiguration);
        if (!validation.valid) {
            setError(validation.message);
            throw new Error(validation.message);
        }
        try {
            const res = await fetch("/api/weights/update", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newConfiguration),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || `Erreur ${res.status}`);
            }

            const data = await res.json();
            
            if (!data.success) {
                throw new Error(data.message || "Erreur inconnue");
            }

            setWeights(prev => prev.map(w => 
                w.sessionId === sessionId 
                    ? { ...w, ...newConfiguration, total: newConfiguration.competencesPct + newConfiguration.experiencePct + newConfiguration.formationPct + newConfiguration.historiquePct }
                    : w
            ));
            return data;
        } catch (err) {
            setError(err.message || "Erreur lors de la mise à jour");
            throw err;
        }
    }, []);

    // Le fetch est déclenché par le composant consommateur via fetchWeights()

    return { weights, isLoading, error, fetchWeights, updateWeight };
};