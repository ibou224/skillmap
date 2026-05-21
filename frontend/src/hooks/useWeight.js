import { useState, useCallback } from "react";
import { isValidateWeights } from "@/lib/validation";

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
            experiencePct: newWeights.experiencePct,
            formationPct: newWeights.formationPct,
            historiquePct: newWeights.historiquePct,
        };
        if (!isValidateWeights(newConfiguration).valid) {
            setError(isValidateWeights(newConfiguration).message);
            return;
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